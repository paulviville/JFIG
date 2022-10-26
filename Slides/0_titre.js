import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from '../CMapJS/Utils/Display.js';
import * as Holes from '../Files/holes_files.js';
import {loadGraph} from '../CMapJS/IO/GraphFormats/GraphIO.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
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

export const slide_titre = new Slide(
	function(DOM_Hand0, DOM_Hand1, DOM_Hand2, DOM_Hand3, DOM_Hand4)
	{
		this.camera = new THREE.PerspectiveCamera(75, DOM_Skel1D.width / DOM_Skel1D.height, 0.1, 1000.0);
		// this.camera.position.set(0, 0.69, 0.39);
		// this.camera.lookAt(0, 0, 0);

		// const surface_layer = 0;
		// const mixte_layer = 1;
		// const curve_layer = 2;

		// const context_input = DOM_Skel1D.getContext('2d');
		// const context_output = DOM_Skel2D.getContext('2d');

		// const orbit_controls_input = new OrbitControls(this.camera, DOM_Skel1D);
		// const orbit_controls_output = new OrbitControls(this.camera, DOM_Skel2D);

		this.scene = new THREE.Scene()
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiant_light_int);
		const pointLight = new THREE.PointLight(0xFFFFFF, point_light_int);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(mixte_layer);
		pointLight.layers.enable(mixte_layer);
		ambiantLight.layers.enable(curve_layer);
		pointLight.layers.enable(curve_layer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		// this.holes_surface = Display.loadSurfaceView("off", Holes.holes_off, {transparent: true, opacity: 0.1});
		// this.holes_surface.layers.set(surface_layer);
		// this.group.add(this.holes_surface);

		// let holes_skel = loadIncidenceGraph('ig', Holes.holes_ig);
		// this.holes_skel = new Renderer(holes_skel);
		// this.holes_skel.edges.create({layer: mixte_layer, material: mesh_edge_material}).addTo(this.group);
		// this.holes_skel.faces.create({layer: mixte_layer, side: THREE.DoubleSide}).addTo(this.group);

		// let holes2_skel = loadIncidenceGraph('ig', Holes.holes2_ig);
		// this.holes2_skel = new Renderer(holes2_skel);
		// this.holes2_skel.edges.create({layer: curve_layer, material: mesh_edge_material}).addTo(this.group);


		// this.holes_vol = Display.load_volumes_view("mesh", holes_mesh);
		// this.holes_vol = Display.loadVolumesView("mesh", Holes.holes_mesh);
		// this.holes_vol.layers.set(mixte_layer);
		// this.group.add(this.holes_vol);

		// this.holes2_vol = Display.loadVolumesView("mesh", Holes.holes2_mesh);
		// this.holes2_vol.layers.set(curve_layer);
		// this.group.add(this.holes2_vol);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;
		
		// this.toggle_clipping = function(){
		// 	this.holes_vol.material.uniforms.clipping.value = 1 - this.holes_vol.material.uniforms.clipping.value;
		// };

		// this.toggle_visible = function(){
		// 	this.holes_vol.visible = !this.holes_vol.visible;
		// 	this.holes2_vol.visible = !this.holes2_vol.visible;
		// };

		// this.toggle_visible();

		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};

		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 90 * this.time);

				// this.holes_surface.material.opacity = 0.5;
				// this.holes_surface.material.side = THREE.FrontSide;
				// this.camera.layers.enable(curve_layer);
				// glRenderer.setSize(DOM_Skel1D.width, DOM_Skel1D.height);
				// glRenderer.render(this.scene, this.camera);
				// context_input.clearRect(0, 0, DOM_Skel1D.width, DOM_Skel1D.height);
				// context_input.drawImage(glRenderer.domElement, 0, 0)
				// this.camera.layers.disable(curve_layer);

				// this.holes_surface.material.opacity = 0.3;
				// this.holes_surface.material.side = THREE.BackSide;

				// this.camera.layers.enable(mixte_layer);
				// glRenderer.render(this.scene, this.camera);
				// context_output.clearRect(0, 0, DOM_Skel2D.width, DOM_Skel2D.height);
				// context_output.drawImage(glRenderer.domElement, 0, 0);
				// this.camera.layers.disable(mixte_layer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});