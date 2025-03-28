frappe.pages['hourly-attendance'].on_page_load = function(wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Hourly Attendance',
        single_column: true
    });

    // Add date filters
    const date_from = page.add_field({
        label: 'From Date',
        fieldtype: 'Date',
        default: frappe.datetime.week_start(),
        change: () => load_data()
    });

    const date_to = page.add_field({
        label: 'To Date',
        fieldtype: 'Date',
        default: frappe.datetime.week_end(),
        change: () => load_data()
    });

    // Refresh button
    page.set_secondary_action(__("Refresh"), () => load_data());

    function load_data() {
        frappe.call({
            method: 'jobtracker.hrms.page.hourly_attendance.hourly_attendance.get_attendance_data',
            args: {
                from_date: date_from.get_value(),
                to_date: date_to.get_value()
            },
            callback: function(r) {
                if (r.message) {
                    render_table(r.message);
                }
            }
        });
    }

    function render_table(data) {
        // Clear previous content but preserve your exact HTML structure
        let $table = $(page.body).find('#table-outer');
        if (!$table.length) {
            $table = $(`
                <table id="table-outer" class="table table-bordered">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Day</th>
                            <th colspan="4">Monday</th>
                            <th colspan="4">Tuesday</th>
                            <th colspan="4">Wednesday</th>
                            <th colspan="4">Thursday</th>
                            <th colspan="4">Friday</th>
                            <th colspan="4">Saturday</th>
                            <th colspan="4">Sunday</th>
                        </tr>
                        <tr>
                            <td></td>
                            <td>Date</td>
                            ${Array(7).fill().map(() => `
                                <th>In</th>
                                <th>Out</th>
                                <th>Hours</th>
                                <th>Payout</th>
                            `).join('')}
                        </tr>
                        <tr>
                            <td>Employee</td>
                            <td>Standard Rate:<br>Total Time:<br>Total Payout</td>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `).appendTo(page.body);
        }

        const $tbody = $table.find('tbody').empty();

        // Group by employee
        const employees = {};
        data.forEach(record => {
            if (!employees[record.employee]) {
                employees[record.employee] = {
                    name: record.employee_name,
                    days: Array(7).fill(null),
                    weekly_hours: 0,
                    weekly_payout: 0
                };
            }
            
            const day_idx = record.day_of_week;
            employees[record.employee].days[day_idx] = record;
            employees[record.employee].weekly_hours += record.working_hours;
            employees[record.employee].weekly_payout += record.total_payout;
        });

        // Add rows for each employee
        Object.values(employees).forEach(emp => {
            const $row = $(`
                <tr>
                    <td>${emp.name}</td>
                    <td>
                        ₹${emp.days.find(d => d)?.regular_payout?.toFixed(2) || '0.00'}<br>
                        ${emp.weekly_hours.toFixed(1)} hrs<br>
                        ₹${emp.weekly_payout.toFixed(2)}
                    </td>
                    ${emp.days.map(day => day ? `
                        <td>${day.in_time}</td>
                        <td>${day.out_time}</td>
                        <td>${day.working_hours.toFixed(1)}</td>
                        <td>₹${day.total_payout.toFixed(2)}</td>
                    ` : `
                        <td>-</td>
                        <td>-</td>
                        <td>0.0</td>
                        <td>₹0.00</td>
                    `).join('')}
                </tr>
            `).appendTo($tbody);
        });
    }

    // Initial load
    load_data();
};