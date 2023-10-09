import axios from 'axios';
import config from '../config/configuration.js';


export default class OlogService {

	// Get logbook list
	findLogbooks() {
		let url = `${config.serverPath}/Olog/logbooks`;
		return axios.get(url).then(res => res.data);
	}

	// Get single logbook
	findSingleLogbook(name) {
		let url = `${config.serverPath}/Olog/logbooks/${name}`;
		return axios.get(url).then(res => res.data);
	}

	// Build the logbook summary with logbook name, log count and the last log 
	findLogbookInfo(logbookName) {
		let url = `${config.serverPath}/Olog/logs/search?logbooks=${logbookName}&sort=down&from=0&size=1`;
		return axios.get(url).then(res => {
			if(!res.data) {
				return {
					name: logbookName,
					count: 0,
					author: null,
					createdDate: null,
				};
			}

			let info;
			let count = res.data.hitCount;
			let logs = res.data.logs;
			if(count === 0 || !logs || !logs.length) {
				info = {
					name: logbookName,
					count: 0,
					author: null,
					createdDate: null,
				};
			} else {
				let log = logs[0];
				info = {
					name: logbookName,
					count: count,
					author: log.owner,
					createdDate: log.createdDate,
				};
			}
			return info;
		});
	}

	// Get tag list
	findTags() {
		let url = `${config.serverPath}/Olog/tags`;
		return axios.get(url).then(res => res.data);
	}

	// Get property list
	findProperties() {
		let url = `${config.serverPath}/Olog/properties`;
		return axios.get(url).then(res => res.data);
	}

	// Get logs in page
	findLogs(logbookName, first, rows) {
		let url = `${config.serverPath}/Olog/logs/search?logbooks=${logbookName}&sort=down&from=${first}&size=${rows}`;
		return axios.get(url).then(res => res.data);
	}

	// Get single log
	findSingleLog(id) {
		let url = `${config.serverPath}/Olog/logs/${id}`;
		return axios.get(url).then(res => res.data);
	}

	// Build attachment URL
	attachmentUrl(attachmentId) {
		let url = `${config.serverPath}/Olog/attachment/${attachmentId}`;
		return url;
	}

	// Get current user data using the "SESSION" cookie
	currentUser() {
		let url = `${config.serverPath}/Olog/user`;
		return axios.get(url, {
            withCredentials: true  // Enable cookie
		}).then(res => res.data);
	}

	// Create a new log using "multipart/form-data" content type
	submitLogFormData(formData) {
		let url = `${config.serverPath}/Olog/logs/multipart?markup=commonmark`;
		return axios.put(url, formData, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data',
			},
			withCredentials: true  // Enable cookie
		}).then(res => res.data);
	}

	// Update an existing log using "application/json" content type
	updateLog(logId, formData) {
		let url = `${config.serverPath}/Olog/logs/${logId}`;
		return axios.post(url, formData, {
			headers: {
				'Accept': 'application/json',
				// 'Content-Type': 'multipart/form-data',
			},
			withCredentials: true  // Enable cookie
		}).then(res => res.data);
	}

}