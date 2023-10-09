<template>
	<div>
		<DataView :value="logs" layout="list" :paginator="true" :rows="10"
					paginatorPosition="both" :pageLinkSize="3" ref="dt"
					paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink" :rowsPerPageOptions="[5,10,25,50,100]"
					:lazy="true" :totalRecords="totalRecords" @page="onPage($event)">
			<template #header>
				<div class="flex flex-wrap align-items-center justify-content-between gap-2">
					<span style="font-size: large; color: RGB(33, 150, 243)">
						<i style="margin-right: .5em" class="fa fa-book"></i>
						<span>{{ logbook.replace('+', ' ') }}</span>
					</span>
					<Button v-if="userInfo" label="New" icon="pi pi-plus" rounded raised size="small" @click="onLogCreateClick()" />
				</div>
			</template>

			<template #list="slotProps">
				<div class="col-12" @click="onLogClick(slotProps.data)">
					<div style="padding: 1rem;">
						<div class="shadow-3">
							<div class="grid border">
								<div class="col-6 border-right" :style="{ 'background-color': logHeaderColor(slotProps.index, slotProps.data) }">
									<span># {{ slotProps.data['id'] }}</span>
								</div>
								<div class="col-6" :style="{ 'background-color': logHeaderColor(slotProps.index, slotProps.data) }">
									<span>{{ showDateTime(slotProps.data['createdDate']) }}</span>
								</div>
								<div class="col-6 border-top border-right" :style="{ 'background-color': logHeaderColor(slotProps.index, slotProps.data) }">
									<span>{{ slotProps.data['owner'] }}</span>
								</div>
								<div class="col-6 border-top" :style="{ 'background-color': logHeaderColor(slotProps.index, slotProps.data) }">
									<span>{{ slotProps.data['level'] }}</span>
								</div>
								<div class="col-12 border-top" :style="{ 'color': 'RGB(33, 150, 243)', 'background-color': logHeaderColor(slotProps.index, slotProps.data) }">
									{{ slotProps.data['title'] }}
									&nbsp;&nbsp;
									<i v-if="slotProps.data['attachments'] && slotProps.data['attachments'].length" class="pi pi-paperclip p-text-secondary">{{ slotProps.data['attachments'].length }}</i>
								</div>
								<div class="col-12 border-top" :style="{ 'background-color': logHeaderColor(slotProps.index, slotProps.data) }">
									<div class="max-lines" v-html="slotProps.data['description']"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<template #empty>
				<div style="color: orange; padding: 10px;">No records found.</div>
			</template>
		</DataView>
	</div>
</template>

<script>
import moment from 'moment';
import OlogService from '../service/OlogService';

export default {
	data() {
        return {
            logbook: null,
			first: null,
			rows: null,
			logs: [],
			totalRecords: 0,
        }
    },
	ologService: null,

	created() {
		this.ologService = new OlogService();
		this.logbook = this.$route.params.logbook;
	},

	mounted() {
		this.resetLazyParams();
		this.loadLazyData();
	},

	activated() {
		// console.log('activated');
    },

    deactivated () {
		// console.log('deactivated');
    },

	methods: {
		loadLazyData() {
			let loader = this.$loading.show();
			this.ologService.findLogs(this.logbook, this.first, this.rows)
			.then(data => {
				this.logs = data.logs;
				this.totalRecords = data.hitCount;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load logs', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load logs', detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		onPage(event) {
            this.first = event.first;
			this.rows = event.rows;
            this.loadLazyData();
        },
		resetLazyParams() {
			this.first = 0;
			this.rows = this.$refs.dt.rows;
		},
		onLogClick(log) {
			this.$router.push({ name: 'logdetail', params: { logbook: this.logbook, log: log['id'] }});
		},
		onLogCreateClick() {
			this.$router.push({name: 'logedit', params: { logbook: this.logbook, log: 'new' }});
		},
		logHeaderColor(index, log) {
			if (!log) return
			let dateNow = new Date();

			if(log.modifyDate) {
				let modifyDate = new Date(log.modifyDate);
				if (modifyDate.getTime() > dateNow.getTime() - 3 * 60 * 1000) 
					return 'rgb(255, 204, 204)';
			} else if(log.createdDate) {
				let createdDate = new Date(log.createdDate);
				if (createdDate.getTime() > dateNow.getTime() - 3 * 60 * 1000) 
					return 'rgb(255, 204, 204)';
			}
			return index % 2 ? 'Cornsilk' : 'LightCyan';
		},
		showDateTime(value) {
			return moment(value).format("YYYY-MM-DD HH:mm:ss");
		},
	},

	computed: {
		userInfo() {
            return this.$store.state.authentication.user;
        },
    }

}
</script>

<style scoped>
.content {
	border: 1px solid RGBA(33, 150, 243, 0.2);
	padding: .5em;
}

.border {
	border: 1px solid RGBA(33, 150, 243, 0.8);
}

.border-top {
	border-top: 1px solid RGBA(33, 150, 243, 0.8);
}

.border-bottom {
	border-bottom: 1px solid RGBA(33, 150, 243, 0.8);
}

.border-left {
	border-left: 1px solid RGBA(33, 150, 243, 0.8);
}

.border-right {
	border-right: 1px solid RGBA(33, 150, 243, 0.8);
}

.max-lines {
  display: block;/* or inline-block */
  word-wrap: break-word;
  overflow-y: hidden;
  max-height: 4.8em;
  line-height: 1.8em;
}

</style>
