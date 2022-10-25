import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from '../CMapJS/Utils/Display.js';
import * as Vessels from '../Files/vessels_files.js';
import {loadGraph} from '../CMapJS/IO/GraphFormats/GraphIO.js'
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer} from './parameters.js';

let ambiant_light_int = 0.4;
let point_light_int = 0.6;

// let glRenderer = new THREE.WebGLRenderer({
// 	antialias: true,
// 	alpha: true});

let mesh_edge_color = new THREE.Color(0x333333);

let mesh_edge_material = new THREE.LineBasicMaterial({
	color: mesh_edge_color,
	linewidth: 0.9,
	polygonOffset: true,
	polygonOffsetFactor: -0.5
});

export const slide_objectif = new Slide(
	function(DOM_input, DOM_output)
	{
		this.camera = new THREE.PerspectiveCamera(75, DOM_input.width / DOM_input.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 1);

		const input_layer = 0;
		const output_layer = 1;
		const skeleton_layer = 2;

		const context_input = DOM_input.getContext('2d');
		const context_output = DOM_output.getContext('2d');

		const orbit_controls_input = new OrbitControls(this.camera, DOM_input);
		const orbit_controls_output = new OrbitControls(this.camera, DOM_output);

		this.scene = new THREE.Scene()
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiant_light_int);
		const pointLight = new THREE.PointLight(0xFFFFFF, point_light_int);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(input_layer);
		pointLight.layers.enable(input_layer);
		ambiantLight.layers.enable(output_layer);
		pointLight.layers.enable(output_layer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		this.vessels_surface = Display.loadSurfaceView("off", Vessels.vessels_off, {transparent: true, opacity: 0.1});
		this.vessels_surface.layers.set(input_layer);
		this.group.add(this.vessels_surface);

		let vessels_skel = loadGraph('cg', Vessels.vessels_cg);
		this.vessels_skel = new Renderer(vessels_skel);
		console.info(this.vessels_skel);
		this.vessels_skel.edges.create({layer: skeleton_layer, material: mesh_edge_material}).addTo(this.group);

		// this.vessels_vol = Display.load_volumes_view("mesh", lung_mesh);
		this.vessels_vol = Display.loadVolumesView("mesh", Vessels.vessels_mesh);
		this.vessels_vol.layers.set(output_layer);
		this.group.add(this.vessels_vol);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;

		this.toggle_clipping = function(){
			this.vessels_vol.material.uniforms.clipping.value = 1 - this.vessels_vol.material.uniforms.clipping.value;
		};

		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		}

		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 90 * this.time);

				this.vessels_surface.material.opacity = 0.5;
				this.vessels_surface.material.side = THREE.FrontSide;
				this.camera.layers.enable(skeleton_layer);
				glRenderer.setSize(DOM_input.width, DOM_input.height);
				glRenderer.render(this.scene, this.camera);
				context_input.clearRect(0, 0, DOM_input.width, DOM_input.height);
				context_input.drawImage(glRenderer.domElement, 0, 0)
				this.camera.layers.disable(skeleton_layer);

				this.vessels_surface.material.opacity = 0.3;
				this.vessels_surface.material.side = THREE.BackSide;

				this.camera.layers.enable(output_layer);
				glRenderer.render(this.scene, this.camera);
				context_output.clearRect(0, 0, DOM_output.width, DOM_output.height);
				context_output.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(output_layer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});