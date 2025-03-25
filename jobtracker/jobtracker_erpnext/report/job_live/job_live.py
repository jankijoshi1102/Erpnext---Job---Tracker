import frappe
from datetime import datetime, timedelta
from frappe.utils import now_datetime, get_datetime, add_days

def execute(filters=None):
	columns, data = get_columns(), get_data()
	chart=get_chart_data(data)
	if not data:
		frappe.msgprint("No records found")
	return columns, data,None,chart

def get_columns():
    columns = [
        {"fieldname": "name", "label": "Job Name", "fieldtype": "Data", "width": 200},
        {"fieldname": "user_comment", "label": "Comment:Data:150", "fieldtype": "Data", "width": 150},
        {"fieldname": "Customer", "label": "Customer:Link/Customer:300", "fieldtype": "Data", "width": 250},
        {"fieldname": "Date", "label": "Date", "fieldtype": "Int", "width": 200},
        {"fieldname": "Due_date", "label": "Due:Date:Data:120", "fieldtype": "Data", "width": 200},
        {"fieldname": "Priority", "label": "Priority", "fieldtype": "Data", "width": 200},
        {"fieldname": "Process_title", "label": "Process:Data:200", "fieldtype": "Data", "width": 200},
        {"fieldname": "Reference_no", "label": "Reference:Data:150", "fieldtype": "Data", "width": 200},
        {"fieldname": "Start_time", "label": "Start Time:Data:200", "fieldtype": "Data", "width": 200},
        {"fieldname": "status", "label": "Status", "fieldtype": "Data", "width": 200},
        {"fieldname": "User", "label": "Worker:Data:150", "fieldtype": "Data", "width": 200}
    ]
    return columns


def get_data():
	data = frappe.db.sql('''
						select job.name,(DATE_FORMAT(job.Date,'%%d-%%m-%%Y'))
						,job.Customer ,job.Reference_no `Reference:Data:150`,job.Priority,DATE_FORMAT(job.Due_date,'%%d-%%m-%%Y'),job.Status
						,pros.Process_title
						,DATE_FORMAT(pros.Start_time,'%%d-%%m-%%Y %%h:%%I %%p')
						,pros.User
						,pros.user_comment
						from `tabJob Tracker` job 
						inner join `tabProcess Multiple Table` pros on job.name=pros.parent
						where job.status='Assigned'
						and CONCAT(pros.parent,'-',pros.process_name) in  
						(select job
						from (select ROW_NUMBER() OVER (PARTITION BY parent ORDER BY idx) AS row_num, CONCAT(parent,'-',process_name) job,start_time from `tabProcess Multiple Table`
						where end_time IS NULL) qr
						where qr.row_num=1
						)
						order by job.name
						''',as_dict=1)
	frappe.log_error("data",data)	
	return data



def get_chart_data(data):
    if not data:
        return None
    
    job_counts = {}
    
    for row in data:
        job_name = row['Process_title']
        if job_name in job_counts:
            job_counts[job_name] += 1
        else:
            job_counts[job_name] = 1
    
    labels = list(job_counts.keys())
    values = list(job_counts.values())
    
    chart = {
        "data": {
            "labels": labels,
            "datasets": [
                {
                    "name": "Job Count",
                    "values": values
                }
            ]
        },
        "type": "bar",
        "axisOptions": {"xAxisMode": "tick", "xIsSeries": True}
    }
    
    return chart