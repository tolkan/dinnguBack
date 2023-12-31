//Server ve application arasındaki istekler sırasında oluşabilecek hatalar

class response{
	constructor(data=null,errors=null){
		this.errors=errors;
		this.data=data;
	}
	success(res){
		return res.status(200).json({
			status: true,
			data: this.data
		})
	}
	created(res){
		return res.status(201).json({
			status: true,
			data: this.data
		})
	}

	error500(res){
		res.status(500).json({
			status: "error",
			errors: this.errors
		})
	}

	error400(res){
		res.status(400).json({
			status: "error",
			errors: this.errors
		})
	}

	notFound(res){
		res.status(404).json({
			status: false,
			data: "not found"
		})
	}
}

module.exports = response;
