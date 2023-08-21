import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from './Display.js';
import * as hand from '../Files/hand_files.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, meshEdgeMaterial, ambiantLightInt, pointLightInt} from './parameters.js';



export const slide_refine = new Slide(
	function(DOM_Input, DOM_Output)
	{
		this.camera = new THREE.PerspectiveCamera(75, DOM_Input.width / DOM_Input.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 1.4);
		
		const surfaceLayer = 0;
		const meshLayer = 1;
		const rawLayer = 2;

		const context_input = DOM_Input.getContext('2d');
		const context_output = DOM_Output.getContext('2d');

		const orbit_controls_input = new OrbitControls(this.camera, DOM_Input);
		const orbit_controls_output = new OrbitControls(this.camera, DOM_Output);

		this.scene = new THREE.Scene()	
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiantLightInt);
		const pointLight = new THREE.PointLight(0xFFFFFF, pointLightInt);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(meshLayer);
		pointLight.layers.enable(meshLayer);
		ambiantLight.layers.enable(surfaceLayer);
		pointLight.layers.enable(surfaceLayer);
		ambiantLight.layers.enable(rawLayer);
		pointLight.layers.enable(rawLayer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		this.handSurface = Display.loadSurfaceView("off", hand.hand_off, {transparent: true, opacity: 0.1});
		this.handSurface.layers.set(surfaceLayer);
		this.group.add(this.handSurface);

		this.handRawVol = Display.loadVolumesView("mesh", hand.handRaw_mesh);
		this.handRawVol.layers.set(surfaceLayer);
		this.group.add(this.handRawVol);
		// const handSkel = loadIncidenceGraph('ig', hand.hand_ig);
		// this.handSkel = new Renderer(handSkel);
		// this.handSkel.edges.create({layer: surfaceLayer, material: meshEdgeMaterial, size: 80}).addTo(this.group);
		// this.handSkel.faces.create({layer: surfaceLayer, side: THREE.DoubleSide}).addTo(this.group);


		this.handVol = Display.loadVolumesView("mesh", hand.hand_mesh);
		this.handVol.layers.set(meshLayer);
		this.group.add(this.handVol);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;
		
		this.toggle_clipping = function(){
			this.handVol.material.uniforms.clipping.value = 1 - this.handVol.material.uniforms.clipping.value;
		};

		this.toggle_visible = function(){
			this.handVol.visible = !this.handVol.visible;
		};


		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};
		const offsetAngleHand = Math.PI/2;
		const offsetAxisHand = new THREE.Vector3(0, 0.3, -0.9);
		this.handSurface.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		this.handRawVol.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		this.handVol.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		this.handSurface.material.side = THREE.BackSide;


		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 90 * this.time);

				this.handSurface.material.opacity = 0.5;
				this.handSurface.material.side = THREE.FrontSide;
				this.camera.layers.enable(rawLayer);
				this.camera.layers.enable(surfaceLayer);
				glRenderer.setSize(DOM_Input.width, DOM_Input.height);
				glRenderer.render(this.scene, this.camera);
				context_input.clearRect(0, 0, DOM_Input.width, DOM_Input.height);
				context_input.drawImage(glRenderer.domElement, 0, 0)
				this.camera.layers.disable(rawLayer);
				this.camera.layers.disable(surfaceLayer);


				this.camera.layers.enable(meshLayer);
				glRenderer.render(this.scene, this.camera);
				context_output.clearRect(0, 0, DOM_Output.width, DOM_Output.height);
				context_output.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(meshLayer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});