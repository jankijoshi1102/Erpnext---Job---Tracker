frappe.pages['job-list'].on_page_load = function (wrapper) {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
        sessionStorage.setItem('hasReloaded', true);
    } else {
        sessionStorage.removeItem('hasReloaded');
        window.location.reload();
    }

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Job List',
        single_column: true
    });

    let date_from = page.add_field({
        label: 'Date From',
        fieldtype: 'Date',
        fieldname: 'date_from',
        default: new Date(new Date().getFullYear(), 0, 1), // Set default to start of the year
        change() {
            // Get the values of other fields
            var from_date = date_from ? date_from.get_value() : null;
            var to_date = date_to ? date_to.get_value() : null;
            var reference_no = referenceno ? referenceno.get_value() : null;
            var processname = process ? process.get_value() : null;
            var customer = customer_field ? customer_field.get_value() : null;
    
            // Call apply_filters with the updated values
            get_job_data(page, from_date, to_date, processname, customer, reference_no);
        }
    });
    

    let date_to = page.add_field({
        label: 'Date To',
        fieldtype: 'Date',
        fieldname: 'date_to',
        default: frappe.datetime.month_end(new Date()),
        change() {
            // Get the values of other fields
            var from_date = date_from ? date_from.get_value() : null;
            var to_date = date_to ? date_to.get_value() : null;
            var reference_no = referenceno ? referenceno.get_value() : null;
            var processname = process ? process.get_value() : null;
            var customer = customer_field ? customer_field.get_value() : null;
    
            // Call apply_filters with the updated values
            get_job_data(page,from_date,to_date,processname,customer,reference_no)
        }
    });
    let customer_field = page.add_field({
        label: 'Customer',
        fieldtype: 'Link',
        fieldname: 'customer',
        options:'Customer',
        change() {
            // Get the values of other fields
            var from_date = date_from ? date_from.get_value() : null;
            var to_date = date_to ? date_to.get_value() : null;
            var reference_no = referenceno ? referenceno.get_value() : null;
            var processname = process ? process.get_value() : null;
            var customer = customer_field ? customer_field.get_value() : null;
            console.log("haaaaa",customer)
    
            // Call apply_filters with the updated values
            get_job_data(page,from_date,to_date,processname,customer,reference_no)
        }
    })

    let referenceno = page.add_field({
        label: 'Reference',
        fieldtype: 'Data',
        fieldname: 'reference_no',
        change() {
            // Get the values of other fields
            var from_date = date_from ? date_from.get_value() : null;
            var to_date = date_to ? date_to.get_value() : null;
            var reference_no = referenceno ? referenceno.get_value() : null;
            var processname = process ? process.get_value() : null;
            var customer = customer_field ? customer_field.get_value() : null;
    
            // Call apply_filters with the updated values
            get_job_data(page,from_date,to_date,processname,customer,reference_no)
        }
    })
    let process = page.add_field({
        label: 'Process',
        fieldtype: 'Link',
        fieldname: 'process',
        options:'Job Process Name',
        default:'Welding',
        // hidden:true,
        change() {
            // Get the values of other fields
            var from_date = date_from ? date_from.get_value() : null;
            var to_date = date_to ? date_to.get_value() : null;
            var reference_no = referenceno ? referenceno.get_value() : null;
            var processname = process ? process.get_value() : null;
            var customer = customer_field ? customer_field.get_value() : null;
    
            // Call apply_filters with the updated values
            get_job_data(page,from_date,to_date,processname,customer,reference_no)
        }
    })
    let blank_field = page.add_field({
        fieldtype: 'HTML',
        fieldname: 'blank',
        label: 'blank',
        options: `<div style='padding-right:226px;'></div>`,
    });
    
  
    let barcode = page.add_field({
        label: 'Scan BarCode',
        fieldtype: 'Data',
        options: 'Barcode',
        fieldname: 'barcode',
        change() {
            console.log('Barcode field change event triggered');
            let barcode_input = barcode.get_value();
            //let regex_pattern = /^\d{5}:JPN-\d{3}$/; // Regex pattern for the format
            let regex_pattern = /^JOB-\d{5}:JPN-\d{3}$/;

            console.log('Barcode input:', barcode_input);

            if (barcode_input.trim() === '') {
                console.log('Barcode input is empty, skipping validation');
                return;
            }

            if (!regex_pattern.test(barcode_input)) {
                console.log('Invalid barcode format');
                frappe.msgprint(__("Please enter a barcode in the format 'JOB-00002:JPN-001'"));
                barcode.set_value(""); // Clear the field if format is incorrect
                return;
            }

            console.log('Valid barcode format');
            submitEmployeeCredentials(barcode_input);
            barcode.$input.val(""); // Clear the field after submission
        }
    });



    let photo_scan = page.add_field({
        label: 'Camera',
        fieldtype: 'Button',
        fieldname: 'photo_scan'
    });


   

   
   
   
    let $btn2 = page.set_secondary_action(
        `<i class="octicon octicon-sync"></i> Refresh`,
        () => {
            var from_date = date_from.get_value();
            var to_date = date_to.get_value();
            var reference_no = referenceno ? referenceno.get_value() : null;
            var processname = process ? process.get_value() : null;
            var customer = customer_field ? customer_field.get_value() : null;
            if (from_date && to_date) {
                get_job_data(page, from_date, to_date, processname, customer, reference_no)
            }
        },
        undefined,
        `class="btn btn-secondary btn-default btn-sm" id="myCustomButton"`
    );
    $btn2.appendTo($('.page-form.row'));

    $(page.body).on('click', '[data-fieldname="photo_scan"]', function (e) {
        const scanner = new frappe.ui.Scanner({
            dialog: true, // open camera scanner in a dialog
            multiple: false, // stop after scanning one value
            on_scan(data) {
                //   handle_scanned_barcode(data.decodedText);
                // console.log(data.decodedText)
                submitEmployeeCredentials(data.decodedText);
            }
        });
    })


    // -----------check employee password-----------
    $(page.body).on('click', '.btn-primary', function (e) {
        var jobName = e.target.id;


        // Get the button text and convert to lowercase
        submitEmployeeCredentials(jobName);
    });
    $(page.body).on('click', '.btn-danger', function (e) {
        var jobName = e.target.id;

        // Get the button text and convert to lowercase
        submitEmployeeCredentials(jobName);
    });

    function submitEmployeeCredentials(jobName) {
        frappe.call({
            method: 'jobtracker.jobtracker_erpnext.page.job_list.job_list.check_process',
            args: {
                job_name: jobName
            },
            freeze: true,
            callback: (r) => {
                // on success
                check_employee()
                var from_date = date_from.get_value();
                var to_date = date_to.get_value();
                var reference_no = referenceno ? referenceno.get_value() : null;
                var processname = process ? process.get_value() : null;
                var customer = customer_field ? customer_field.get_value() : null;
                if (from_date && to_date) {
                    get_job_data(page,from_date,to_date,processname,customer,reference_no)
                }
            },
            error: (r) => {
                // frappe.msgprint("Job Not Found");
            }
        })
        let user_comment
        function check_employee() {
            var dialog = new frappe.ui.Dialog({
                title: 'Enter Employee Credentials',
                fields: [
                    {
                        fieldtype: 'HTML',
                        // label: 'Employee',
                        // fieldname: 'name',
                        options: `<h3>Submit To start Job: <b> ${jobName.split(":")[0]}</b></h3>`,
                    },
                    {
                        fieldtype: 'Link',
                        label: 'Employee',
                        fieldname: 'name',
                        options: 'Employee'
                        // reqd: true
                    },
                    {
                        fieldtype: 'Password',
                        label: 'Password',
                        fieldname: 'password',
                        // reqd: true
                    },
                    {
                        fieldtype: 'Small Text',
                        label: 'User Comment ',
                        fieldname: 'user_comment'
                        // reqd: true
                    },
                    {
                        fieldtype: 'Data',
                        label: 'Scan Employee',
                        fieldname: 'scan_employee',
                        options: 'Barcode',
                        // reqd: true
                    }
                ],
                primary_action_label: 'Submit',
                primary_action: async function (values) {
                    var employee = values.name;
                    var password = values.password;
                    var scan_employee = values.scan_employee;
                    user_comment=values.user_comment || null
                    console.log("sca",scan_employee)
                    dialog.hide();
                    
                    // Check if both employee name and password are provided
                    if (employee){
                        if (employee && password) {
                            try {
                                const result = await frappe.db.get_value('Employee', { 'name': employee, 'custom_process_password': password }, 'name');
                                let employee_name = result.message.name;
                                if (employee_name) {
                                    await frappe.call({
                                        method: 'jobtracker.jobtracker_erpnext.page.job_list.job_list.set_process_time',
                                        args: {
                                            user_name: employee_name,
                                            job_name: jobName,
                                            user_comment:user_comment
                                        },
                                        freeze: true,
                                        callback: (r) => {
                                            // on success
                                            var from_date = date_from.get_value();
                                            var to_date = date_to.get_value();
                                            var reference_no = referenceno ? referenceno.get_value() : null;
                                            var processname = process ? process.get_value() : null;
                                            var customer = customer_field ? customer_field.get_value() : null;
                                            if (from_date && to_date) {
                                                get_job_data(page,from_date,to_date,processname,customer,reference_no)
                                            }
                                        },
                                        error: (r) => {
                                            // frappe.msgprint("Job Not Found");
                                        }
                                    });
                                    var from_date = date_from.get_value();
                                    var to_date = date_to.get_value();
                                    var reference_no = referenceno ? referenceno.get_value() : null;
                                    var processname = process ? process.get_value() : null;
                                    var customer = customer_field ? customer_field.get_value() : null;
                                    if (from_date && to_date) {
                                        get_job_data(page,from_date,to_date,processname,customer,reference_no)
                                    }
                                } else {
                                    frappe.msgprint("Wrong Password");
                                }
                                console.log(values);
                            } catch (error) {
                                console.log("Error:", error);
                            }
                        } else {
                            // Display a message or take appropriate action if employee name or password is not provided
                            frappe.msgprint("Please enter both employee name and password");
                        }
                    } 
                   

                    }
                   
                
            });
            dialog.fields_dict['scan_employee'].$input.on('input', function () {
                var scan_employee = $(this).val();
                if (scan_employee) {
                    var employee_id = scan_employee;
                    if (employee_id) {
                        let user_comment = dialog.fields_dict['user_comment'].get_value() || null;
                        frappe.db.get_value('Employee', employee_id, 'name')
                        .then(r => {
                            let employee_name = r.message.name; // Renaming to `employee_name` for clarity
                            console.log(employee_name, "name");
                            if (employee_name) {
                                frappe.call({
                                    method: 'jobtracker.jobtracker_erpnext.page.job_list.job_list.set_process_time',
                                    args: {
                                        user_name: employee_name,
                                        job_name: jobName,
                                        user_comment:user_comment
                                    },
                                    freeze: true,
                                    callback: (r) => {
                                        // on success
                                        dialog.hide()
                                        var from_date = date_from.get_value();
                                        var to_date = date_to.get_value();
                                        var reference_no = referenceno ? referenceno.get_value() : null;
                                        var processname = process ? process.get_value() : null;
                                        var customer = customer_field ? customer_field.get_value() : null;
                                        if (from_date && to_date) {
                                            get_job_data(page,from_date,to_date,processname,customer,reference_no)
                                        }
                                    }
                                    ,
                                    error: (r) => {
                                        // frappe.msgprint("Job Not Found");
                                    }
                                });
                            } else {
                                // Handle the case when the employee is not found more gracefully
                                frappe.throw("Employee Not Found");
                            }
                        });
                    }
                }
            });
           
            dialog.show();

        }

    }
}

function get_job_data(page,from_date, to_date, processname, customer, refrenceno) {
    frappe.call({
        method: 'jobtracker.jobtracker_erpnext.page.job_list.job_list.filtered_data',
        args: {
            from_date: from_date,
            to_date: to_date,
            processname: processname,
            customer: customer,
            refrenceno: refrenceno
        },
        callback: async function (r) {
            try {
                console.log(r.message);
                let records = r.message;
                console.log("final", records);
                let name=processname

                for (let page_row of records) {
                    const new_job = await frappe.db.get_doc("Job Tracker", page_row.name);
                    for (let child of new_job.process_multiple_table) {
                        if (child.start_time && !child.end_time) {
                            page_row['process_name'] = child.process_title;
                            page_row['start_time'] = start_date_format(child.start_time);
                            page_row['user_name'] = child.user;
                            page_row['date'] = frappe.format(page_row.date, { fieldtype: 'Date' });
                            page_row['due_date'] = page_row.due_date ? frappe.format(page_row.due_date, { fieldtype: 'Date' }) : "";
                            page_row['barcode'] = `${page_row.name}:${child.process_name}`;
                            break;
                        } else if (!child.user_name) {
                            page_row['process_name'] = child.process_title;
                            page_row['p_name'] = child.process_name;
                            page_row['barcode'] = `${page_row.name}:${child.process_name}`;
                            page_row['date'] = frappe.format(page_row.date, { fieldtype: 'Date' });
                            page_row['due_date'] = page_row.due_date ? frappe.format(page_row.due_date, { fieldtype: 'Date' }) : "";
                            page_row['start_time'] = "";
                            page_row['user_name'] = "";
                            break;
                        }
                    }
                }

                // Sort the records based on the name field
                records.sort((a, b) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                console.log("recs",records)
                const filteredRecords = records.filter(record => record.p_name ===name);
                // console.log("fil",filteredRecords)
                // console.log("name",name)
                if (name){
                    $(frappe.render_template('job_list', { data: filteredRecords })).appendTo(page.body);
                }
                else{
                $(frappe.render_template('job_list', { data: records })).appendTo(page.body);}


                const section = document.getElementsByClassName('layout-main-section');
                const lastTable = section[0].querySelector('table:last-child');
                const tables = section[0].getElementsByTagName('table');
                for (let j = 0; j < tables.length; j++) {
                    tables[j].style.display = 'none';
                }
                lastTable.style.display = 'table';
            } catch (error) {
                console.log(error);
            }
        }
    });
}






function start_date_format(start_date) {
    // Create a Date object from the start_time string
    var startTime = new Date(start_date);

    // Set the options for formatting the date and time
    var options = {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true // Use 12-hour clock format
    };

    // Format the date and time string
    var formattedDateTime = startTime.toLocaleString('en-AU', options);

    // Replace the comma with a space
    formattedDateTime = formattedDateTime.replace(',', '');

    return formattedDateTime;
}
