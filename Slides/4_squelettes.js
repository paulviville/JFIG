import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from '../CMapJS/Utils/Display.js';
import * as Holes from '../Files/holes_files.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, meshEdgeMaterial, ambiantLightInt, pointLightInt} from './parameters.js';


export const slide_squelettes = new Slide(
	function(DOM_Skel1D, DOM_Skel2D)
	{
		// console.toholesVolumes;
		this.camera = new THREE.PerspectiveCamera(45, DOM_Skel1D.width / DOM_Skel1D.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 1.3);
		
		const surface_layer = 0;
		const mixte_layer = 1;
		const curve_layer = 2;

		const context_input = DOM_Skel1D.getContext('2d');
		const context_output = DOM_Skel2D.getContext('2d');

		const orbit_controls_input = new OrbitControls(this.camera, DOM_Skel1D);
		const orbit_controls_output = new OrbitControls(this.camera, DOM_Skel2D);

		this.scene = new THREE.Scene()
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiantLightInt);
		const pointLight = new THREE.PointLight(0xFFFFFF, pointLightInt);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(mixte_layer);
		pointLight.layers.enable(mixte_layer);
		ambiantLight.layers.enable(curve_layer);
		pointLight.layers.enable(curve_layer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		this.holes_surface = Display.loadSurfaceView("off", Holes.holes_off, {transparent: true, opacity: 0.1});
		this.holes_surface.layers.set(surface_layer);
		this.group.add(this.holes_surface);

		const holes_skel = loadIncidenceGraph('ig', Holes.holes_ig);
		this.holes_skel = new Renderer(holes_skel);
		this.holes_skel.edges.create({layer: mixte_layer, material: meshEdgeMaterial}).addTo(this.group);
		this.holes_skel.faces.create({layer: mixte_layer, side: THREE.DoubleSide}).addTo(this.group);

		const holes2_skel = loadIncidenceGraph('ig', Holes.holes2_ig);
		this.holes2_skel = new Renderer(holes2_skel);
		this.holes2_skel.edges.create({layer: curve_layer, material: meshEdgeMaterial}).addTo(this.group);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;
		
		this.toggle_clipping = function(){
			this.holes_vol.material.uniforms.clipping.value = 1 - this.holes_vol.material.uniforms.clipping.value;
		};

		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};

		const offsetAngle = Math.PI / 2.4;
		const offsetAxis = new THREE.Vector3(1, 0, 0);
		this.holes_surface.setRotationFromAxisAngle(offsetAxis, offsetAngle);
		this.holes_skel.edges.mesh.setRotationFromAxisAngle(offsetAxis, offsetAngle);
		this.holes2_skel.edges.mesh.setRotationFromAxisAngle(offsetAxis, offsetAngle);
		this.holes_skel.faces.mesh.setRotationFromAxisAngle(offsetAxis, offsetAngle);

		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 50 * this.time);

				this.holes_surface.material.opacity = 0.5;
				this.holes_surface.material.side = THREE.FrontSide;
				this.camera.layers.enable(curve_layer);
				glRenderer.setSize(DOM_Skel1D.width, DOM_Skel1D.height);
				glRenderer.render(this.scene, this.camera);
				context_input.clearRect(0, 0, DOM_Skel1D.width, DOM_Skel1D.height);
				context_input.drawImage(glRenderer.domElement, 0, 0)
				this.camera.layers.disable(curve_layer);

				this.camera.layers.enable(mixte_layer);
				glRenderer.render(this.scene, this.camera);
				context_output.clearRect(0, 0, DOM_Skel2D.width, DOM_Skel2D.height);
				context_output.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(mixte_layer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});