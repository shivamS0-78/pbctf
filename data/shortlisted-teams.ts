// Shortlisted teams data for Zenith Hackathon Finals

export interface ShortlistedTeam {
  teamCode: string;
  teamName: string;
  memberCount: number;
}

export const shortlistedTeams: ShortlistedTeam[] = [
  { teamCode: "FAKXJNU", teamName: "--rebase", memberCount: 4 },
  { teamCode: "V5LVEC", teamName: "AlgoRhythm", memberCount: 4 },
  { teamCode: "IX2G2XC", teamName: "ALPHAGO", memberCount: 3 },
  { teamCode: "6WJKZX9", teamName: "Array of Sunshine", memberCount: 4 },
  { teamCode: "G6BMZPE", teamName: "Bit Lords", memberCount: 3 },
  { teamCode: "IQJL0KB", teamName: "Byte Me", memberCount: 3 },
  { teamCode: "HKVEPOB", teamName: "Code Commanders", memberCount: 4 },
  { teamCode: "JBR45QK", teamName: "Code X", memberCount: 3 },
  { teamCode: "T2IYQBM", teamName: "Codeoholics", memberCount: 3 },
  { teamCode: "4WMPCDP", teamName: "Comrades", memberCount: 4 },
  { teamCode: "SY8NC6N", teamName: "Ctrl+Alt+Defeat", memberCount: 3 },
  { teamCode: "MK7G9W3", teamName: "CyberSphere", memberCount: 4 },
  { teamCode: "PQ2R8XL", teamName: "Data Dynamos", memberCount: 3 },
  { teamCode: "NV6Y1WZ", teamName: "Debug Thugs", memberCount: 4 },
  { teamCode: "RLTP5H4", teamName: "Exception Handlers", memberCount: 3 },
  { teamCode: "BF9KM2J", teamName: "Full Stack Attackers", memberCount: 4 },
  { teamCode: "WX3Z7CV", teamName: "Git Gud", memberCount: 3 },
  { teamCode: "H8JN4PL", teamName: "Hash Browns", memberCount: 4 },
  { teamCode: "Y1QS6DK", teamName: "Infinite Loop", memberCount: 3 },
  { teamCode: "A5TF0MC", teamName: "Kernel Panic", memberCount: 4 },
  { teamCode: "E2UV8GA", teamName: "Logic Bombs", memberCount: 3 },
  { teamCode: "K9XW3BP", teamName: "Merge Conflicts", memberCount: 4 },
  { teamCode: "C4ZR7NJ", teamName: "Neural Network", memberCount: 3 },
  { teamCode: "D7EI2LS", teamName: "Null Pointers", memberCount: 4 },
  { teamCode: "F6HK1OT", teamName: "Pixel Pioneers", memberCount: 3 },
  { teamCode: "L3MQ9VU", teamName: "Query Masters", memberCount: 4 },
  { teamCode: "O0RY4WX", teamName: "Runtime Terror", memberCount: 3 },
  { teamCode: "U8SA5ZC", teamName: "Stack Overflow", memberCount: 4 },
  { teamCode: "Q1TB6DG", teamName: "Sudo Squad", memberCount: 3 },
  { teamCode: "S4UC7EH", teamName: "Tech Titans", memberCount: 4 },
  { teamCode: "V7WD8FI", teamName: "The Debuggers", memberCount: 3 },
  { teamCode: "X0YE9GJ", teamName: "Zero Division", memberCount: 4 },
];

// Calculate total participants
export const totalParticipants = shortlistedTeams.reduce(
  (sum, team) => sum + team.memberCount,
  0
);
