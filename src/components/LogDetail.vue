<template>
	<div>
		<div class="col-12">
			<h3 style="color: RGB(33, 150, 243); text-align: center; margin-bottom: .5em;">
				<i style="margin-right: .5em" class="fa fa-book"></i>
				<span>{{ logbook.replace('+', ' ') }}</span>
			</h3>
			<div style="padding-left: 1rem; padding-right: 1rem;" class="flex flex-wrap align-items-center justify-content-between gap-2">
				<Button :disabled="!canEdit" label="Edit" icon="fa fa-pencil" severity="warning" rounded raised size="small" @click="onEditClick()" />
				<Button :disabled="true" label="Delete" icon="fa fa-trash" severity="danger" rounded raised size="small" @click="onDeleteClick()" />
			</div>
		</div>
		<div class="col-12">
			<div style="padding-bottom: 1rem; padding-left: 1rem; padding-right: 1rem;">
				<div class="grid border">
					<div class="col-4 border-right" style="background-color: RGB(179, 217, 255)">
						Author
					</div>
					<div class="col-8" style="background-color: RGBA(221, 238, 187)">
						{{ log['owner'] }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						Created
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ showDateTime(log['createdDate']) }}
					</div>
					<div v-if="log && log.modifyDate" class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						Modified
					</div>
					<div v-if="log && log.modifyDate" class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ showDateTime(log['modifyDate']) }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						Logbooks
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						<span v-for="(logbook, index) of log.logbooks" :key="index" style="margin-bottom: 10px">
							<span v-if="index !== 0">, </span>
							<span>{{ logbook.name }}</span>
						</span>
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						Tags
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						<span v-for="(tag, index) of log.tags" :key="index" style="margin-bottom: 10px">
							<span v-if="index !== 0">, </span>
							<span>{{ tag.name }}</span>
						</span>
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						Entry Type
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ log['level'] }}
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						Title
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						{{ log['title'] }}
					</div>
					<div v-html="log['description']" class="content" style="white-space: pre-wrap;"></div>

					<div v-for="(item, index) of log.attachments" :key="index" class="col-12" style="padding-bottom: 0">
						<div class="grid">
							<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
								Attachment {{ index + 1 }}
							</div>
							<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187); word-wrap: break-word;">
								<!-- <a :href="attachmentUrl(item.id)">{{ item.filename }}</a> -->
								<div style="cursor: pointer; color: rgb(59,130,246);" @click="openAttachment(item.id)">
									<span>{{ item.filename }}</span>
								</div>
							</div>
							<div class="col-12">
								<Image v-if="isImageFile(item.filename)" :src="attachmentUrl(item.id)" alt="Image" width="250" preview />
								<a v-else :href="attachmentUrl(item.id)"><img src="@/assets/file-icon.png" alt="File" width="100"/></a>
							</div>
						</div>
					</div>

					<div v-for="(property, index) of log.properties" :key="index" class="col-12" style="padding-bottom: 0">
						<div class="grid">
							<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
								Property {{ index + 1 }}
							</div>
							<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187); word-wrap: break-word;">
								{{ property.name }}
							</div>
							<div v-for="(attribute, index) of property.attributes" :key="index" class="col-12" style="padding-bottom: 0">
								<div class="grid">
									<div class="col-4 border-top border-right">
										{{ attribute.name }}
									</div>
									<div class="col-8 border-top">
										{{ attribute.value }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<Dialog header="Message confirmation" v-model:visible="logDeleteConfirmDisplay" :style="{ width: '100vw' }" :modal="true">
            <div>
                <i class="fa fa-exclamation-circle fa-2x" style="vertical-align: middle; color: orange"></i>
                <span class="p-text-center ml-2" style="vertical-align: middle">Really delete this entry?</span>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="logDeleteConfirmDisplay=false" class="p-button-text"/>
                <Button label="OK" icon="pi pi-check" @click="deleteLog" />
            </template>
        </Dialog>
	</div>
</template>

<script>
import moment from 'moment';
import OlogService from '../service/OlogService';

export default {
	data() {
        return {
            logbook: null,
			log: {},
			logId: null,
			logDeleteConfirmDisplay: false,
        }
    },
	ologService: null,

	created() {
		this.ologService = new OlogService();

		this.logbook = this.$route.params.logbook;
		this.logId = this.$route.params.log;
	},

	mounted() {
		this.loadData();
	},

	methods: {
		loadData() {
			let loader = this.$loading.show();
			this.ologService.findSingleLog(this.logId)
			.then(data => {
				this.log = data;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load the log', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load the log', detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		onEditClick() {
			this.$router.push({name: 'logedit', params: { logbook: this.logbook, log: this.logId }});
		},
		onDeleteClick() {
			this.logDeleteConfirmDisplay = true;
		},
		deleteLog() {
			
		},
		isImageFile(url) {
			let imageExtensions = ['JPG', 'jpg', 'JPEG', 'jpeg', 'PNG', 'png', 'GIF', 'gif', 'BMP', 'bmp'];
			let ext = url.split('.').pop();
			return imageExtensions.includes(ext) ? true : false;
		},
		attachmentUrl(attachmentId) {
            return this.ologService.attachmentUrl(attachmentId);
        },
		openAttachment(attachmentId) {
            window.open(this.attachmentUrl(attachmentId));
        },
		showDateTime(value) {
			return moment(value).format("YYYY-MM-DD HH:mm:ss");
		},
	},

	computed: {
		userInfo() {
            return this.$store.state.authentication.user;
        },
		canEdit() {
			return this.userInfo && this.log && this.userInfo.userName === this.log['owner'];
		},
    }

}
</script>

<style scoped>
.content {
	border-top: 1px solid RGBA(33, 150, 243, 0.8);
	padding: .5em;
	width: 100%;
	overflow: auto;
	min-height: 4.8em;
	line-height: 1.8em;
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
