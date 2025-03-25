
import frappe
from frappe.utils import now

@frappe.whitelist()
def set_process_time(user_name, job_name,user_comment):
    # frappe.throw(f"{user_comment}")
    job = job_name.split(":")[0]
    # job = job_name[:5]

    jt_doc = frappe.get_doc('Job Tracker', job)
    
    for item in jt_doc.process_multiple_table:
        if item.barcode == job_name:
            idx = item.idx
            
            # Find the previous item
            prev_item = next((x for x in jt_doc.process_multiple_table if x.idx == idx - 1), None)
            
            # Check if the previous item exists and its end_time is set
            if idx != 1 and (not prev_item or not prev_item.end_time):
                frappe.throw("Please complete the previous job before starting this one.")
                
            # Set the user_name and update start/end time based on the conditions
            time = now().split('.')[0]  # Get current time without fractions
            item.user_name = user_name
            if user_comment:
                item.user_comment=user_comment
            if not item.start_time:
                item.start_time = time
            elif item.end_time:
                frappe.throw("Job already ended.")
            else:
                item.end_time = time
    
    jt_doc.save()

@frappe.whitelist()
def check_process(job_name):
    job = job_name.split(":")[0]
    jt_doc = frappe.get_doc('Job Tracker', job)
    
    for item in jt_doc.process_multiple_table:
        if item.barcode == job_name:
            idx = item.idx
            
            # Find the previous item
            prev_item = next((x for x in jt_doc.process_multiple_table if x.idx == idx - 1), None)
            
            # Check if the previous item exists and its end_time is set
            if idx != 1 and (not prev_item or not prev_item.end_time):
                frappe.throw("Please complete the previous job before starting this one.")
                
            # Set the user_name and update start/end time based on the conditions
            time = now().split('.')[0]  # Get current time without fractions
           
            if item.end_time:
                frappe.throw("Job already ended.")
        # else:
        #     frappe.throw("Job not found")




@frappe.whitelist()
def filtered_data(from_date, to_date, processname, customer, refrenceno):
    filters = [['status', 'in', ['Assigned']]]
    if from_date and to_date:
        filters.append(['date', 'between', [from_date, to_date]])
    if customer:
        filters.append(['customer', '=', customer])
    if refrenceno:
        filters.append(['reference_no', '=', refrenceno])
    records = frappe.get_list('Job Tracker',
                              filters=filters,
                              fields=['name', 'date', 'customer', 'due_date', 'reference_no', 'priority', 'status', 'job_description'])
    return records
