<template>
	<div>
		<DataView :value="tags" layout="list" :paginator="true" :rows="10"
					paginatorPosition="both" :pageLinkSize="3"
					paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink">
			<template #header>
				<div class="flex flex-wrap align-items-center justify-content-between gap-2">
					<span style="font-size: large; color: RGB(33, 150, 243)">
						<i style="margin-right: .5em" class="pi pi-tag"></i>
						<span>Tag list</span>
					</span>
				</div>
			</template>

			<template #list="slotProps">
				<div class="col-12">
					<div style="padding: 1rem;">
						<div class="grid border shadow-2">
							<div class="col-6 border-right" :style="{ 'background-color': logHeaderColor(slotProps.index) }">
								<span style="font-weight: bold">{{ slotProps.data['name'] }}</span>
							</div>
							<div class="col-6 border-right" :style="{ 'background-color': logHeaderColor(slotProps.index) }">
								
							</div>
							<div class="col-6 border-top border-right" :style="{ 'background-color': logHeaderColor(slotProps.index) }">
								<span>{{ slotProps.data['state'] }}</span>
							</div>
							<div class="col-6 border-top" :style="{ 'background-color': logHeaderColor(slotProps.index) }">
								
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
import OlogService from '../service/OlogService';

export default {
	data() {
        return {
			tags: [],
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
			let loader = this.$loading.show();
			this.ologService.findTags()
			.then(data => {
				this.tags = data;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load tags', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load tags', detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		logHeaderColor(index) {
			return index % 2 ? 'Cornsilk' : 'LightCyan';
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

</style>
