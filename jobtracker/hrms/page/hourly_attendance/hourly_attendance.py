import frappe
from frappe.utils import now

@frappe.whitelist()
def filtered_data(from_date, to_date,employee):
    if from_date and to_date:
        filters.append(['date',])
    if employee:
        filter.append(['employee', '=', employee])
    records = frappe.get_list('Attendance',
                              filter=filters,
                              fields=['employee', 'time', ])
    return records