import frappe
from frappe.utils import getdate, nowtime, flt
from datetime import timedelta

@frappe.whitelist()
def get_attendance_data(from_date=None, to_date=None):
    """Fetch data matching your custom payout structure"""
    # Default to current week if no dates
    if not from_date or not to_date:
        today = getdate()
        from_date = today - timedelta(days=today.weekday())  # Monday
        to_date = from_date + timedelta(days=6)              # Sunday
    
    # Get all attendance records
    records = frappe.get_all("Attendance",
        filters={
            "attendance_date": ["between", [from_date, to_date]],
            "docstatus": 1,
            "status": "Present"
        },
        fields=["name", "employee", "employee_name", "attendance_date", 
                "in_time", "out_time", "working_hours",
                "custom_regular_payout", "custom_payout_upto_3_hours",
                "custom_payout_more_than_3_hours", "custom_total_payout"],
        order_by="attendance_date, employee"
    )

    data = []
    for record in records:
        # Calculate day of week (Monday=0)
        day_of_week = record.attendance_date.weekday()
        
        data.append({
            "employee": record.employee,
            "employee_name": record.employee_name,
            "attendance_date": record.attendance_date.strftime("%Y-%m-%d"),
            "day_of_week": day_of_week,
            "in_time": record.in_time.strftime("%H:%M") if record.in_time else "-",
            "out_time": record.out_time.strftime("%H:%M") if record.out_time else "-",
            "working_hours": flt(record.working_hours, 1),
            "regular_payout": flt(record.custom_regular_payout, 2),
            "upto_3_hours": flt(record.custom_payout_upto_3_hours, 2),
            "more_than_3_hours": flt(record.custom_payout_more_than_3_hours, 2),
            "total_payout": flt(record.custom_total_payout, 2)
        })

    return data