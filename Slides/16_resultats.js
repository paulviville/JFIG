import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from '../CMapJS/Utils/Display.js';
import * as Dilo from '../Files/dilo_files.js';
import * as Hand from '../Files/hand_files.js';
import * as Holes from '../Files/holes_files.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, meshEdgeColor, meshEdgeMaterial, ambiantLightInt, pointLightInt} from './parameters.js';


export const slide_results1 = new Slide(
	function(DOM_Dilo, DOM_Hand)
	{
		this.camera0 = new THREE.PerspectiveCamera(75, DOM_Dilo.width / DOM_Dilo.height, 0.1, 1000.0);
		this.camera0.position.set(0, 0, 0.8);
		this.camera1 = new THREE.PerspectiveCamera(75, DOM_Dilo.width / DOM_Dilo.height, 0.1, 1000.0);
		this.camera1.position.set(0, 0, 1.4);
		
		const handLayer = 1;
		const diloLayer = 2;

		const context_input = DOM_Dilo.getContext('2d');
		const context_output = DOM_Hand.getContext('2d');

		const orbit_controls_input = new OrbitControls(this.camera0, DOM_Dilo);
		const orbit_controls_output = new OrbitControls(this.camera1, DOM_Hand);

		this.scene = new THREE.Scene()
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiantLightInt);
		const pointLight = new THREE.PointLight(0xFFFFFF, pointLightInt);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(handLayer);
		pointLight.layers.enable(handLayer);
		ambiantLight.layers.enable(diloLayer);
		pointLight.layers.enable(diloLayer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		this.dilo_surface = Display.loadSurfaceView("off", Dilo.dilo_off, {transparent: true, opacity: 0.3});
		this.dilo_surface.layers.set(diloLayer);
		this.group.add(this.dilo_surface);

		this.hand_surface = Display.loadSurfaceView("off", Hand.hand_off, {transparent: true, opacity: 0.3});
		this.hand_surface.layers.set(handLayer);
		this.group.add(this.hand_surface);

		const hand_skel = loadIncidenceGraph('ig', Hand.hand2D_ig);
		this.hand_skel = new Renderer(hand_skel);
		this.hand_skel.edges.create({layer: handLayer, material: meshEdgeMaterial}).addTo(this.group);
		this.hand_skel.faces.create({layer: handLayer, side: THREE.DoubleSide}).addTo(this.group);

		const dilo_skel = loadIncidenceGraph('ig', Dilo.dilo_ig);
		this.dilo_skel = new Renderer(dilo_skel);
		this.dilo_skel.edges.create({layer: diloLayer, material: meshEdgeMaterial}).addTo(this.group);
		this.dilo_skel.faces.create({layer: diloLayer, side: THREE.DoubleSide}).addTo(this.group);


		this.hand_vol = Display.loadVolumesView("mesh", Hand.hand_mesh);
		this.hand_vol.layers.set(handLayer);
		this.group.add(this.hand_vol);

		this.dilo_vol = Display.loadVolumesView("mesh", Dilo.dilo_mesh);
		this.dilo_vol.layers.set(diloLayer);
		this.group.add(this.dilo_vol);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;
		
		this.toggle_clipping = function(){
			this.hand_vol.material.uniforms.clipping.value = 1 - this.hand_vol.material.uniforms.clipping.value;
			this.dilo_vol.material.uniforms.clipping.value = 1 - this.dilo_vol.material.uniforms.clipping.value;
		};

		this.toggle_visible = function(){
			this.hand_vol.visible = !this.hand_vol.visible;
			this.dilo_vol.visible = !this.dilo_vol.visible;
			this.hand_skel.edges.mesh.visible = !this.hand_skel.edges.mesh.visible;
			this.dilo_skel.edges.mesh.visible = !this.dilo_skel.edges.mesh.visible;
			this.hand_skel.faces.mesh.visible = !this.hand_skel.faces.mesh.visible;
			this.dilo_skel.faces.mesh.visible = !this.dilo_skel.faces.mesh.visible;
		};

		this.toggle_material = function(){
			this.hand_vol.material.uniforms.quality.value = 1 - this.hand_vol.material.uniforms.quality.value;
			this.dilo_vol.material.uniforms.quality.value = 1 - this.dilo_vol.material.uniforms.quality.value;
		}


		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};

		const offsetAngleDilo = Math.PI ;
		const offsetAxisDilo = new THREE.Vector3(1, 0, 0);
		this.dilo_surface.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);
		this.dilo_skel.edges.mesh.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);
		this.dilo_skel.faces.mesh.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);
		this.dilo_vol.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);
		
		const offsetAngleHand = Math.PI/2;
		const offsetAxisHand = new THREE.Vector3(0, 0.3, -0.9);
		this.hand_surface.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		this.hand_vol.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		this.hand_surface.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		this.hand_skel.edges.mesh.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		this.hand_skel.faces.mesh.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);

		this.hand_vol.visible = false ;
		this.dilo_vol.visible = false;
		this.dilo_surface.visible = true;
		this.hand_skel.edges.mesh.visible = true;
		this.dilo_skel.edges.mesh.visible = true;
		this.hand_skel.faces.mesh.visible = true;

		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 90 * this.time);

				// this.dilo_surface.material.opacity = 0.5;
				// this.dilo_surface.material.side = THREE.FrontSide;
				this.camera0.layers.enable(diloLayer);
				glRenderer.setSize(DOM_Dilo.width, DOM_Dilo.height);
				glRenderer.render(this.scene, this.camera0);
				context_input.clearRect(0, 0, DOM_Dilo.width, DOM_Dilo.height);
				context_input.drawImage(glRenderer.domElement, 0, 0)
				this.camera0.layers.disable(diloLayer);

				this.dilo_surface.material.opacity = 0.3;
				this.dilo_surface.material.side = THREE.BackSide;
				this.hand_surface.material.side = THREE.BackSide;

				this.camera1.layers.enable(handLayer);
				glRenderer.render(this.scene, this.camera1);
				context_output.clearRect(0, 0, DOM_Hand.width, DOM_Hand.height);
				context_output.drawImage(glRenderer.domElement, 0, 0);
				this.camera1.layers.disable(handLayer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});