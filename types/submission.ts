export interface Submission {
  id: number;
  submissionDate: string;
  restaurantName: string;
  receiptPhoto: string;
  selfiePhoto: string;
  status: 'approved' | 'pending' | 'rejected';
  category: string;
  points?: number;
}