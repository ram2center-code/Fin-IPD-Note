/**
 * Utility functions for mapping and formatting data
 */

export const mapDBToState = (r) => ({
  id: r.id,
  hn: r.hn,
  fullName: r.full_name,
  age: r.age,
  room: r.room,
  stayDays: r.stay_days,
  checkDate: r.check_date,
  paymentType: r.payment_type,
  recordType: r.record_type,
  totalAmount: r.total_amount,
  deposit: r.deposit,
  balance: r.balance,
  notifyCount: r.notify_count,
  note: r.note,
  recordedBy: r.recorded_by,
  isAcknowledged: r.is_acknowledged || false
});

export const mapStateToDB = (formData, session) => ({
  hn: formData.hn,
  full_name: formData.fullName,
  age: formData.age,
  room: formData.room,
  stay_days: formData.stayDays,
  check_date: formData.checkDate,
  payment_type: formData.paymentType,
  record_type: formData.recordType,
  total_amount: parseFloat(formData.totalAmount) || 0,
  deposit: parseFloat(formData.deposit) || 0,
  balance: parseFloat(formData.balance) || 0,
  notify_count: formData.notifyCount,
  note: formData.note,
  recorded_by: formData.recordedBy || session?.user?.user_metadata?.display_name || session?.user?.email?.split('@')[0] || 'User',
  is_acknowledged: formData.isAcknowledged || false
});
