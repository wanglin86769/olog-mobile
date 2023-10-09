<template>
	<div>
		<Panel header="Logbook summary" :toggleable="true">
			<div v-if="logbooks && logbooks.length">
				<div v-for="(logbook, index) of logbooks" :key="index">
					<div class="col-12">
						<div class="card shadow-2" @click="onLogbookClick(logbook.name)">
								<div class="grid">
									<div class="col-9" style="color: RGB(33, 150, 243)">
										<i class="fa fa-book"></i>
										<span style="margin-left: .5em;">{{logbook.name}}</span>
									</div>
									<div class="col-3">
										{{logbook.count}}
									</div>
									<div class="col-12">
										<div v-if="logbook.createdDate && logbook.author">{{showDateTime(logbook.createdDate)}} by {{logbook.author}}</div>
										<div v-else>----</div>
									</div>
								</div>
						</div>
					</div>
				</div>
			</div>
			<div v-else>
				<div class="col-12">
					<div style="color: orange">No records found.</div>
				</div>
			</div>
        </Panel>

		<Panel header="Demo" :toggleable="true" v-if="!logbooks || !logbooks.length">
			<div class="col-12">
				<div class="card shadow-2" @click="onLogbookClick('Demo logbook 1')">
					<div class="grid">
						<div class="col-9" style="color: RGB(33, 150, 243)">
							<i class="fa fa-book"></i>
							<span style="margin-left: .5em;">Demo logbook 1</span>
						</div>
						<div class="col-3">
							N/A
						</div>
						<div class="col-12">
							N/A
						</div>
					</div>
				</div>
			</div>
			<div class="col-12">
				<div class="card shadow-2" @click="onLogbookClick('Demo logbook 2')">
					<div class="grid">
						<div class="col-9" style="color: RGB(33, 150, 243)">
							<i class="fa fa-book"></i>
							<span style="margin-left: .5em;">Demo logbook 2</span>
						</div>
						<div class="col-3">
							N/A
						</div>
						<div class="col-12">
							N/A
						</div>
					</div>
				</div>
			</div>
        </Panel>
	</div>
</template>

<script>
import moment from 'moment';
import OlogService from '../service/OlogService';

export default {
	data() {
        return {
            logbooks: [],
        }
    },
	ologService: null,

	created() {
		this.ologService = new OlogService();
	},

	mounted() {
		this.loadData();
	},

	methods: {
		loadData() {
			this.logbooks = [];
			this.ologService.findLogbooks()
			.then(data => {
				let logbooks = data;
				let promises = [];
				for(let logbook of logbooks) {
					promises.push(this.ologService.findLogbookInfo(logbook.name));
				}
				Promise.all(promises).then((values) => {
					for(let value of values) {
						this.logbooks.push(value);
					}
				});
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'warn', summary: 'Failed to load logbooks, will show demo logbook only', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'warn', summary: 'Failed to load logbooks, will show demo logbook only', detail: error.message });
				}
			})
		},
		onLogbookClick(name) {
			name = name.replace(' ', '+');
			this.$router.push({name: 'logbook', params: { logbook: name }, query: { randomId: new Date().getTime() }});
		},
		showDateTime(value) {
			return moment(value).format("YYYY-MM-DD HH:mm:ss");
		},
	},

}
</script>

<style scoped>
::v-deep(.p-panel-header) {
	background-color: RGB(153, 230, 255);
}

::v-deep(.p-panel-content) {
	background-color: RGB(247, 247, 247);
}

</style>
