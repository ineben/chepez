export default class CRUDController{
	
	constructor($timeout, $anchorScroll, toastr){
		'ngInject';
		this.$timeout = $timeout;
		this.toastr = toastr;
		this.$anchorScroll = $anchorScroll;
	}
	
	
	search(){
		this.Entity.search.start = 0;
		this.Entity.search.currentPage = 1;
		this.Entity.doSearch();
	}
	
	async insert(){
		const response = await this.Entity.doInsert();
		if(response.success){
			this.search();
		}
	}
	
	setUpdate(item){
		this.Entity.update = angular.copy(item);
		this.editing = true;
		this.$timeout(() => { this.$anchorScroll('edit'); }, 100);
	}
	
	async update(){
		const r = await this.Entity.doUpdate();
		if(r.success){
			this.editing = false;
			this.search();
		}
	}
	
	setDelete(item){
		
		this.Entity.delete = item;
		this.toastr.warning(
			'<input type="button" ng-click="remove()" class="btn btn-danger btn-raised" value="Confirmar"/>',
			'¿Esta Seguro de Eliminar?',
			{
				progressBar:true,
				timeOut: 0,
				extendedTimeOut: 5000,
				closeButton: true,
				allowHtml: true,
				onTap: () => {
					this.delete();
				}
			}
		);
		
	}
	
	async delete(){
		const r = await this.Entity.doDelete();
		if(r.success){			
			if(this.editing && this.Entity.update && this.Entity.update._id == this.delete._id)
				this.editing = false;
		}
			this.search();
	}
	
	
};