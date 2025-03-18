frappe.pages['job-list'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Job List',
		single_column: true
	});

	page.add_button('Refresh', function(){
		location.reload();
	}, 'Actions');

	// frappe.call({
	// 	method: 'jobtracker.jobtracker.jobtracker_erpnext.page.job_list.job_list',
	// 	args:{
	// 		date :
	// 	}
	// })
};