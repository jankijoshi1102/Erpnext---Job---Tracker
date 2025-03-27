frappe.pages['hourly-attendance'].on_page_load = function(wrapper) {

	// check the page is open for the first time or not, if yes it reload data automatically, if not, it will remove flag 
	const hasReloaded = sessionStorage.getItem('hasReloaded');

	if(!hasReloaded){
		sessionStorage.setItem('hasReloaded', true);
	}
	else{
		sessionStorage.removeItem('hasReloaded');
		window.location.reload();
	}

	// Creating page and giving title
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Hourly Rate',
		single_column: true
	});


	//add field - From Date
	let date_from = page.add_field({
		label : 'From Date',
		fieldtype : 'Date',
		fieldname : 'date_from',
		default : new Date(Date.now()-(new Date().getDay() - 1) * 86400000).toISOString().split('T')[0],
		change(){
			//to change the data as per the filter, if there is no data it will leave the field blank
			var from_date = date_from ? date_from.get_value() : null;
			var to_date = date_to ? date_to.get_value():null;
			var employee = employee ? employee.get_value():null;
			//weekly - hour based
			var standard_rate = standard_rate ? standard_rate.get_value():null;
			var total_time = total_time ? total_time.get_value():null;
			var total_payout = total_payout ? total_payout.get_value():null;
			var in_time = in_time ? in_time.get_value():null;
			var out_time = out_time ? out_time.get_value():null;
			// hour base - per day
			var total_time = total_time ? total_time.get_value():null;
			var total_payout = total_payout ? total_payout.get_value():null;
		}
		
	});

	//add field - To Date
	let date_to = page.add_field({
		label: 'To Date',
		fieldtype: 'Date',
		fieldname: 'date_to',
		default : new Date(Date.now()+(new Date().getDay()-1) * 86400000).toISOString().split('T')[0],
		change(){
			//to change the data as per the filter, if there is no data it will leave the field blank
			var from_date = date_from ? date_from.get_value() : null;
			var to_date = date_to ? date_to.get_value():null;
			var employee = employee ? employee.get_value():null;
			//weekly - hour based
			var standard_rate = standard_rate ? standard_rate.get_value():null;
			var total_time = total_time ? total_time.get_value():null;
			var total_payout = total_payout ? total_payout.get_value():null;
			var in_time = in_time ? in_time.get_value():null;
			var out_time = out_time ? out_time.get_value():null;
			// hour base - per day
			var total_time = total_time ? total_time.get_value():null;
			var total_payout = total_payout ? total_payout.get_value():null;
		}
	});

	//add field - Employee
	let employee = page.add_field({
		label : 'Employee',
		fieldtype : 'Link',
		fieldname : 'employee',
		options: 'Employee',
		change(){
			//to change the data as per the filter, if there is no data it will leave the field blank
			var from_date = date_from ? date_from.get_value() : null;
			var to_date = date_to ? date_to.get_value():null;
			var employee = employee ? employee.get_value():null;
			//weekly - hour based
			var standard_rate = standard_rate ? standard_rate.get_value():null;
			var total_time = total_time ? total_time.get_value():null;
			var total_payout = total_payout ? total_payout.get_value():null;
			var in_time = in_time ? in_time.get_value():null;
			var out_time = out_time ? out_time.get_value():null;
			// hour base - per day
			var total_time = total_time ? total_time.get_value():null;
			var total_payout = total_payout ? total_payout.get_value():null;
		}
	})

	//Add Button 
	let $btn = page.set_secondary_action(
		`<i class="octicon octicon-sync"></i> Refresh`,
		() => {
			var from_date = date_from.get_value();
			var to_date = date_to.get_value();
			var employee = employee ? employee.get_value() : null;
			if (from_date && to_date) {
				get_data(page, from_date, to_date, emplo)
			}
		},
		undefined,
		`class="btn btn-secondary btn-default btn-sm" id="myCustomButton"`

	);
	//To align the button with the from-date, to-date, employee field which we create upside
	$btn.appendTo($('.page-form.row'));


}