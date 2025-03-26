frappe.pages['employee-checkin-pag'].on_page_load = function (wrapper) {
    // Improved reload logic to prevent constant reloads
    if (!sessionStorage.getItem('hasReloaded')) {
        sessionStorage.setItem('hasReloaded', 'true');
        window.location.reload();
    } else {
        sessionStorage.removeItem('hasReloaded');
    }

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Employee Check-In',
        single_column: true
    });

    // Date field
    let date = page.add_field({
        label: 'Date',
        fieldtype: 'Date',
        fieldname: 'date',
        default: frappe.datetime.get_today()  // Use current date as default
    });

    // Barcode field with validation
    let barcode = page.add_field({
        label: 'Scan Employee Barcode',
        fieldtype: 'Data',
        options: 'Barcode',
        fieldname: 'barcode',
        change() {
            console.log('Barcode field change event triggered');
            let barcode_input = barcode.get_value();
            
            // Improved regex pattern to handle multiple formats
            let regex_pattern = /^JOB-\d{5}:JPN-\d{3}$/;

            console.log('Barcode input:', barcode_input);

            if (barcode_input.trim() === '') {
                console.log('Barcode input is empty, skipping validation');
                return;
            }

            if (!regex_pattern.test(barcode_input)) {
                console.log('Invalid barcode format');
                frappe.msgprint(__("Invalid format. Use 'JOB-00002:JPN-001'"));
                barcode.set_value(""); // Clear the field if format is incorrect
                return;
            }

            console.log('Valid barcode format');
            
            // Add loading indicator
            frappe.show_alert({ message: __('Submitting barcode...'), indicator: 'blue' });

            submitEmployeeCredentials(barcode_input);

            // Clear the field after submission
            barcode.$input.val("");
        }
    });

    // Camera button with click handler
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


    // Format date function
    function start_date_format(start_date) {
        var startTime = new Date(start_date);
        var options = {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: true
        };
        var formattedDateTime = startTime.toLocaleString('en-AU', options).replace(',', '');
        return formattedDateTime;
    }

    // Mock submission function
    function submitEmployeeCredentials(barcode) {
        console.log('Submitting barcode:', barcode);

        frappe.call({
            method: 'jobtracker.jobtracker_erpnext.page.employee_checkin.employee_checkin.submit_barcode',
            args: {
                barcode: barcode,
                date: date.get_value()
            },
            callback: function (r) {
                if (r.message === 'success') {
                    frappe.show_alert({ message: __('Check-in successful'), indicator: 'green' });
                } else {
                    frappe.show_alert({ message: __('Error during check-in'), indicator: 'red' });
                }
            }
        });
    }

    // Camera access function
    function openCamera() {
        frappe.msgprint("Opening camera...");

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                let videoElement = document.createElement('video');
                videoElement.srcObject = stream;
                videoElement.autoplay = true;

                let modal = new frappe.ui.Dialog({
                    title: 'Camera Scan',
                    size: 'large',
                    primary_action_label: 'Capture',
                    primary_action: function () {
                        console.log('Captured!');
                        modal.hide();
                        stream.getTracks().forEach(track => track.stop());
                    }
                });

                modal.$body.append(videoElement);
                modal.show();
            })
            .catch(function (err) {
                console.error('Error accessing camera:', err);
                frappe.msgprint('Failed to access camera');
            });
    }
};
