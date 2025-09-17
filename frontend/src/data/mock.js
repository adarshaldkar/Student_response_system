// Mock data for the Teacher Feedback Collection System

export const mockFormData = {
  id: "form_1",
  year: "3rd Year",
  section: "A",
  subjects: [
    "Digital Electronics",
    "Microprocessors", 
    "Circuit Analysis",
    "Control Systems",
    "Power Electronics",
    "Communication"
  ],
  evaluationCriteria: [
    "Aim/Objectives of the subject made clear",
    "Teaching is well planned and organized", 
    "Teacher comes well prepared in the subject",
    "Teacher keeps himself/herself updated",
    "Subject matter organized in logical sequence",
    "Teacher speaks clearly and audibly",
    "Teacher explains concepts well with examples",
    "Pace and level suited to students",
    "Gives assignments and tests regularly",
    "Marking is fair and impartial",
    "Provides good feedback on performance"
  ]
};

export const ratingScale = [
  { value: 5, label: "Excellent", color: "bg-green-500" },
  { value: 4, label: "Very Good", color: "bg-blue-500" },
  { value: 3, label: "Good", color: "bg-yellow-500" },
  { value: 2, label: "Fair", color: "bg-orange-500" },
  { value: 1, label: "Poor", color: "bg-red-500" }
];

export const mockSubmittedFeedbacks = [
  {
    id: "feedback_1",
    studentId: "CSE001",
    formId: "form_1", 
    timestamp: "2025-01-20T10:30:00Z",
    ratings: {
      "Digital Electronics": {
        "Aim/Objectives of the subject made clear": 5,
        "Teaching is well planned and organized": 4,
        "Teacher comes well prepared in the subject": 5,
        "Teacher keeps himself/herself updated": 4,
        "Subject matter organized in logical sequence": 5,
        "Teacher speaks clearly and audibly": 5,
        "Teacher explains concepts well with examples": 4,
        "Pace and level suited to students": 5,
        "Gives assignments and tests regularly": 4,
        "Marking is fair and impartial": 5,
        "Provides good feedback on performance": 5
      }
    },
    comments: "Great teacher, very helpful!"
  }
];