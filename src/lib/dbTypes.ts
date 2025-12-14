export type ProjectDoc = {
  _id: string;           // ✅ string UUID
  name: string;
  color: string;
  createdAt: string;
};

export type TaskDoc = {
  _id: string;           // ✅ string UUID
  projectId: string;     // ✅ references ProjectDoc._id
  title: string;
  description?: string;
  plannedStart: string;
  plannedEnd: string;
  progress: number;
  status: "todo" | "doing" | "done" | "blocked";
  pinnedToToday: boolean;
  wbs?: string;
  order: number;
  createdAt: string;
};
