export default function Slide(init_func){
	this.open = function(){
		this.running = true;
		this.loop();
	}

	this.close = function(){
		this.running = false;
	}
	
	this.init = init_func.bind(this);
	
	this.running = false;
}