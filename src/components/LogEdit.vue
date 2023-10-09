<template>
	<div>
		<div class="col-12">
			<!-- <h3 style="color: RGB(33, 150, 243); text-align: center; margin-bottom: .5em;">{{ logbook.replace('+', ' ') }}</h3> -->
			<div style="padding-left: 1rem; padding-right: 1rem;" class="flex flex-wrap align-items-center justify-content-between gap-2">
				<span style="font-size: large; color: RGB(33, 150, 243)">
					<i style="margin-right: .5em" class="fa fa-book"></i>
					<span>{{ logbook.replace('+', ' ') }}</span>
				</span>
				<Button v-if="userInfo" label="Submit" icon="fa fa-paper-plane" rounded raised size="small" @click="submitLog()" />
			</div>
		</div>
		
		<div class="col-12">
			<div style="padding-bottom: 0rem; padding-left: 1rem; padding-right: 1rem;">
				<div class="grid border">
					<div class="col-12 border-top" style="background-color: RGB(224, 224, 160)">
						Fields marked with <span style="color: red">*</span> are required
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						<span>Logbooks</span><span style="color: red"> *</span>
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						<MultiSelect v-model="log.logbooks" style="width: 100%" display="chip" :options="logbooks" optionLabel="name" placeholder="Select logbooks" />
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						<span>Tags</span>
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						<MultiSelect v-model="log.tags" style="width: 100%" display="chip" :options="tags" optionLabel="name" placeholder="Select tags" />
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						<span>Level</span><span style="color: red"> *</span>
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						<Dropdown v-model="log.level" style="width: 100%" :options="levelValues" placeholder="Select level" />
					</div>
					<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
						Title<span style="color: red"> *</span>
					</div>
					<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187)">
						<InputText v-model.trim="log.title" placeholder="Please enter your title" style="width: 100%" />
					</div>
					<Textarea v-model="log.description" placeholder="Please enter your message" :autoResize="true" rows="5" style="width: 100%;" />

					<div v-if="logId === 'new'" style="width: 100%;">
						<Panel header="Attachments" :toggleable="true" style="width: 100%;">
							<div>
								<input type="file" id="file" ref="file" multiple v-on:change="handleFileUpload()"/>
							</div>
						</Panel>
					</div>

					<div v-else style="width: 100%;">
						<div v-for="(item, index) of log.attachments" :key="index" class="col-12" style="padding-bottom: 0">
							<div class="grid">
								<div class="col-4 border-top border-right" style="background-color: RGB(179, 217, 255)">
									Attachment {{ index + 1 }}
								</div>
								<div class="col-8 border-top" style="background-color: RGBA(221, 238, 187); word-wrap: break-word;">
									<!-- <a :href="attachmentUrl(item.id)">{{ item.filename }}</a> -->
									<div style="color: rgb(59,130,246);">
										<span>{{ item.filename }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<Panel header="Properties" :toggleable="true" style="width: 100%;">
						<Button label="Add Property" size="small" icon="pi pi-plus" style="margin-bottom: 10px" @click="onAddPropertyClick" />
						<div v-for="(property, index) of log.properties" :key="index" class="col-12" style="padding-bottom: 0">
							<div class="grid">
								<div class="col-12 border-top border-right" style="background-color: RGB(179, 217, 255)">
									<span>{{ property.name }}</span>
									<i class="fa fa-times" style="margin-left: 10px; color: red; cursor: pointer;" @click="removeProperty(index)"></i>
								</div>
								<div v-for="(attribute, index) of property.attributes" :key="index" class="col-12" style="padding-bottom: 0">
									<div class="grid">
										<div class="col-4 border-top">
											{{ attribute.name }}
										</div>
										<div class="col-8 border-top">
											<InputText v-model.trim="attribute.value" placeholder="Attribute value" style="width: 100%" size="small" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</Panel>
				</div>
			</div>
		</div>
		<div class="col-12">
			<div style="padding-left: 1rem; padding-right: 1rem;" class="flex flex-wrap align-items-center justify-content-between gap-2">
				<Button v-if="userInfo" label="Cancel" icon="fa fa-times" rounded raised size="small" text @click="onCancelSubmissionClick()" />
				<Button v-if="userInfo" label="Submit" icon="fa fa-paper-plane" rounded raised size="small" @click="submitLog()" />
			</div>
		</div>

		<Dialog v-model:visible="addPropertyDialog" header="Add Property" :modal="true" style="width: 100%">
			<div v-if="availableProperties && availableProperties.length">
				<div v-for="(property, index) of availableProperties" :key="index">
					<div class="grid">
						<div class="col-8" style="padding: 10px">
							{{ property.name }}
						</div>
						<div class="col-4" style="padding: 10px">
							<Button label="Add" icon="fa fa-plus" rounded raised size="small" @click="addProperty(property)" />
						</div>
					</div>
				</div>
			</div>
			<div v-else>
				<span style="color: orange">No available properties to add</span>
			</div>

			<template #footer>
				<Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="addPropertyDialog=false"/>
			</template>
		</Dialog>

		<Dialog header="Confirmation" v-model:visible="cancelSubmissionDialogDisplay" :style="{ width: '100vw' }" :modal="true">
            <div>
                <i class="fa fa-exclamation-circle fa-2x" style="vertical-align: middle; color: orange"></i>
                <span class="p-text-center ml-2" style="vertical-align: middle">Are you sure you want to abandon the change?</span>
            </div>

            <template #footer>
                <Button label="No" icon="pi pi-times" @click="cancelSubmissionDialogDisplay=false" class="p-button-text"/>
                <Button label="Yes" icon="pi pi-check" @click="cancelSubmission" />
            </template>
        </Dialog>
	</div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import OlogService from '../service/OlogService';

export default {
	data() {
        return {
            logbook: null,
			logId: null,
			log: {},
			attachments: [],
			submittingAttachments: [],

			logbooks: [],
			tags: [],
			levelValues: [
				"Normal",
				"Shift Start",
				"Shift End",
				"Fault",
				"Beam Loss",
				"Beam Configuration",
				"Crew",
				"Expert Intervention Call",
				"Incident"
			],
			properties: [],
			availableProperties: [],

			addPropertyDialog: false,
			cancelSubmissionDialogDisplay: false,
        }
    },
	ologService: null,

	created() {
		this.ologService = new OlogService();

		this.logbook = this.$route.params.logbook;
		this.logId = this.$route.params.log;
	},

	mounted() {
		this.loadLogbooks();
		this.loadTags();
		this.loadProperties();

		if(this.logId === 'new') {
			this.initLog();
		} else {
			this.loadLog();
		}
	},

	methods: {
		loadLogbooks() {
			this.ologService.findLogbooks()
			.then(data => {
				this.logbooks = data;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load logbooks', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load logbooks', detail: error.message });
				}
			});
		},
		loadTags() {
			this.ologService.findTags()
			.then(data => {
				this.tags = data;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load tags', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load tags', detail: error.message });
				}
			});
		},
		loadProperties() {
			this.ologService.findProperties()
			.then(data => {
				this.properties = data;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load properties', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load properties', detail: error.message });
				}
			});
		},
		initLog() {
			let loader = this.$loading.show();
			this.ologService.findSingleLogbook(this.logbook)
			.then(data => {
				this.log = {};
				this.log.logbooks = [data];
				if(this.levelValues && this.levelValues.length) {
					this.log.level = this.levelValues[0];
				}
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load the logbook', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load the logbook', detail: error.message });
				}
			}).finally(() => {
				loader.hide();
			});
		},
		loadLog() {
			let loader = this.$loading.show();
			this.ologService.findSingleLog(this.logId)
			.then(data => {
				this.log = {};
				this.log.id = data['id'];
				this.log.logbooks = data['logbooks'];
				this.log.tags = data['tags'];
				this.log.level = data['level'];
				this.log.title = data['title'];
				this.log.description = data['description'];
				this.log.attachments = data['attachments'];
				this.log.properties = data['properties'];
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
		submitLog() {
			let loader = this.$loading.show();

			let formData = new FormData();
			formData.append("logEntry", new Blob([JSON.stringify(this.log)], {type: 'application/json'}));

			// New attachments
			for(let i = 0; i < this.submittingAttachments.length; i++) {
                formData.append('files', this.submittingAttachments[i]);
            }

			if(this.logId === 'new') {  // Create a new log
				this.ologService.submitLogFormData(formData)
				.then(() => {
					this.$router.push({name: 'logbook', params: { logbook: this.logbook }, query: { randomId: new Date().getTime() }});
				}).catch((error) => {
					if(error.response) {
						this.$toast.add({ severity: 'error', summary: 'Failed to submit the log', detail: error.response.data.message });
					} else {
						this.$toast.add({ severity: 'error', summary: 'Failed to submit the log', detail: error.message });
					}
				}).finally(() => {
					loader.hide();
				});
			} else {  // Update an existing log
				this.ologService.updateLog(this.logId, this.log)
				.then(() => {
					this.$router.push({name: 'logbook', params: { logbook: this.logbook }, query: { randomId: new Date().getTime() }});
				}).catch((error) => {
					if(error.response) {
						this.$toast.add({ severity: 'error', summary: 'Failed to update the log', detail: error.response.data.message });
					} else {
						this.$toast.add({ severity: 'error', summary: 'Failed to update the log', detail: error.message });
					}
				}).finally(() => {
					loader.hide();
				});
			}
		},
		addProperty(property) {
			if(!this.log.properties)  this.log.properties = [];
			this.log.properties.push(property);
			this.addPropertyDialog = false;
		},
		removeProperty(index) {
            this.log.properties.splice(index, 1);
		},
		onAddPropertyClick() {
			this.availableProperties = JSON.parse(JSON.stringify(this.properties));
			for (let i = this.availableProperties.length - 1; i >= 0; i--) {
				if(this.log.properties && this.log.properties.length)
					for(let property of this.log.properties) {
						if(this.availableProperties[i].name === property.name) {
							this.availableProperties.splice(i, 1);
							break;
						}
					}
			}

			this.addPropertyDialog = true;
		},
		onCancelSubmissionClick() {
			this.cancelSubmissionDialogDisplay = true;
		},
		cancelSubmission() {
			this.$router.push({name: 'logbook', params: { logbook: this.logbook }, query: { randomId: new Date().getTime() }});
		},
		handleFileUpload(){
			this.log.attachments = [];
            this.submittingAttachments = this.$refs.file.files;
			for(let attachment of this.submittingAttachments) {
				this.log.attachments.push(
					{
						id: uuidv4(),
						filename: attachment.name,
						fileMetadataDescription: attachment.type
					}
				);
			}
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
	border-top: 1px solid RGBA(33, 150, 243, 0.8);
	padding: .5em;
	width: 100%;
	overflow: auto;
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
