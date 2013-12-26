Easel.Module = DS.Model.extend(
	name: DS.attr('string'),
	displayName: DS.attr('string'),
	type: DS.attr('string'),
	status: DS.attr()
)

Easel.Module.FIXTURES = [
	{
		name: "On/Off Module",
		displayName; "On/Off Module",
		type: "binary",
		status: {
			"power": false
		}
	}
];