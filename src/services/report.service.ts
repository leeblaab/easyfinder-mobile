import { apiClient } from './api-client';

export interface ReviewReport {
  id?: string | number;
  review: string | number;
  reason: 'Spam' | 'Inappropriate' | 'Fake Review' | 'Harassment' | 'Other';
  comment?: string;
  status?: 'pending' | 'resolved';
}

export const reportService = {
  /**
   * Reports a review for content violation
   * @param reviewId ID of the review being reported
   * @param reason The select reason category
   * @param comment Additional user comments
   */
  async reportReview(
    reviewId: string | number,
    reason: 'Spam' | 'Inappropriate' | 'Fake Review' | 'Harassment' | 'Other',
    comment?: string
  ): Promise<ReviewReport> {
    const reportData = {
      review: reviewId,
      reason,
      comment: comment?.trim() || '',
      status: 'pending',
    };

    const response = await apiClient.post<{ data: ReviewReport }>('/items/review_reports', reportData);
    return response.data.data;
  },
};
