import { NextResponse } from "next/server";
import { auth } from "@/Firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { cloudinaryV2 } from "@/c";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";

// Configure route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Configure Cloudinary
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Validation functions
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^\+?\d{10,15}$/.test(phone.replace(/[\s-]/g, ''));
const validateAge = (age: number) => age >= 13 && age <= 100;
const validateURL = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Helper to create success response
function createSuccessResponse(message: string, data: any, status = 200) {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }, { status });
}

// Helper to create error response
function createErrorResponse(message: string, code: string, status: number, details?: string) {
  return NextResponse.json({
    success: false,
    message,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  }, { status });
}

// Upload base64 file to Cloudinary
async function uploadBase64ToCloudinary(base64Data: string, folder: string, resourceType: 'image' | 'raw'): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinaryV2.uploader.upload(
      base64Data,
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract fields
    const {
      name,
      email,
      password,
      phone,
      age,
      organisation,
      bio,
      resume, // base64 encoded PDF
      profile_picture, // base64 encoded image
      leetcode_profile,
      github_link,
      linkedin_link,
      codeforces_link,
      kaggle_link,
      devfolio_link,
      portfolio_link,
      ctf_profile,
      isLooking = false,
    } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!name?.trim() || name.length < 2 || name.length > 100) {
      errors.name = "Name is required (2-100 characters)";
    }

    if (!email?.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Invalid email format";
    }

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(phone)) {
      errors.phone = "Invalid phone format";
    }

    if (age === undefined || age === null) {
      errors.age = "Age is required";
    } else if (!validateAge(Number(age))) {
      errors.age = "Age must be between 13 and 100";
    }

    if (!organisation?.trim() || organisation.length < 2 || organisation.length > 200) {
      errors.organisation = "Organisation is required (2-200 characters)";
    }

    // Optional URL validations
    if (github_link && !validateURL(github_link)) {
      errors.github_link = "Invalid GitHub URL";
    }
    if (linkedin_link && !validateURL(linkedin_link)) {
      errors.linkedin_link = "Invalid LinkedIn URL";
    }
    if (leetcode_profile && !validateURL(leetcode_profile)) {
      errors.leetcode_profile = "Invalid LeetCode URL";
    }
    if (portfolio_link && !validateURL(portfolio_link)) {
      errors.portfolio_link = "Invalid portfolio URL";
    }

    if (Object.keys(errors).length > 0) {
      return createErrorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        400,
        JSON.stringify(errors)
      );
    }

    // Connect to database
    await dbConnect();

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return createErrorResponse(
        "Email already registered",
        "EMAIL_EXISTS",
        409
      );
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return createErrorResponse(
        "Phone number already registered",
        "PHONE_EXISTS",
        409
      );
    }

    // Create Firebase Auth user
    let firebaseUser;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
    } catch (firebaseError: any) {
      if (firebaseError.code === 'auth/email-already-in-use') {
        return createErrorResponse(
          "Email already in use",
          "EMAIL_EXISTS",
          409
        );
      }
      if (firebaseError.code === 'auth/weak-password') {
        return createErrorResponse(
          "Password is too weak",
          "WEAK_PASSWORD",
          400
        );
      }
      throw firebaseError;
    }

    // Upload files to Cloudinary if provided
    let resumeUrl: string | undefined;
    let profilePicUrl: string | undefined;

    if (resume) {
      try {
        resumeUrl = await uploadBase64ToCloudinary(resume, 'zenith/resumes', 'raw');
      } catch (uploadError) {
        console.error('Resume upload error:', uploadError);
        // Continue without resume
      }
    }

    if (profile_picture) {
      try {
        profilePicUrl = await uploadBase64ToCloudinary(profile_picture, 'zenith/profiles', 'image');
      } catch (uploadError) {
        console.error('Profile picture upload error:', uploadError);
        // Continue without profile picture
      }
    }

    // Create user in MongoDB
    const newUser = new User({
      uid: firebaseUser.uid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      age: Number(age),
      organisation: organisation.trim(),
      bio: bio?.trim(),
      resume_link: resumeUrl,
      profile_picture: profilePicUrl,
      leetcode_profile: leetcode_profile?.trim(),
      github_link: github_link?.trim(),
      linkedin_link: linkedin_link?.trim(),
      codeforces_link: codeforces_link?.trim(),
      kaggle_link: kaggle_link?.trim(),
      devfolio_link: devfolio_link?.trim(),
      portfolio_link: portfolio_link?.trim(),
      ctf_profile: ctf_profile?.trim(),
      isLooking: Boolean(isLooking),
      role: 'user',
      teamCode: undefined,
    });

    await newUser.save();

    return createSuccessResponse(
      "Registration successful",
      {
        uid: firebaseUser.uid,
        email: newUser.email,
        name: newUser.name,
        status: "pending_verification",
      },
      201
    );

  } catch (error: any) {
    console.error("Registration error:", error);
    return createErrorResponse(
      "Registration failed",
      "SERVER_ERROR",
      500,
      error.message
    );
  }
}
