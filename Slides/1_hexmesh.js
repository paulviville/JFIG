import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import * as Display from './Display.js';
import * as Holes from '../Files/holes_files.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, ambiantLightInt, pointLightInt} from './parameters.js';


export const slide_hexmesh = new Slide(
	function(DOM_hexmesh)
	{
		this.camera = new THREE.PerspectiveCamera(45, DOM_hexmesh.width / DOM_hexmesh.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 1.3);
		
		const surfaceLayer = 0;
		const meshLayer = 1;

		const contextInput = DOM_hexmesh.getContext('2d');

		const orbitControlsInput = new OrbitControls(this.camera, DOM_hexmesh);

		this.scene = new THREE.Scene()
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiantLightInt);
		const pointLight = new THREE.PointLight(0xFFFFFF, pointLightInt);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(surfaceLayer);
		pointLight.layers.enable(surfaceLayer);
		ambiantLight.layers.enable(meshLayer);
		pointLight.layers.enable(meshLayer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		this.holesSurface = Display.loadSurfaceView("off", Holes.holes_off, {transparent: true, opacity: 0.1});
		this.holesSurface.layers.set(surfaceLayer);
		this.group.add(this.holesSurface);

		this.holesVol = Display.loadVolumesView("mesh", Holes.holes_mesh);
		this.holesVol.layers.set(meshLayer);
		this.group.add(this.holesVol);


		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;
		
		this.toggleClipping = function(){
			this.holesVol.material.uniforms.clipping.value = 1 - this.holesVol.material.uniforms.clipping.value;
		};

		this.toggleVisible = function(){
			this.holesVol.visible = !this.holesVol.visible;
		};

		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};

		const offsetAngle = Math.PI / 2.4;
		const offsetAxis = new THREE.Vector3(1, 0, 0);
		this.holesSurface.setRotationFromAxisAngle(offsetAxis, offsetAngle);
		this.holesVol.setRotationFromAxisAngle(offsetAxis, offsetAngle);


		this.loop = function(){
			if(this.running){
				glRenderer.setSize(DOM_hexmesh.width, DOM_hexmesh.height);
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 15 * this.time);

				this.camera.layers.enable(surfaceLayer);
				this.camera.layers.enable(meshLayer);
				glRenderer.render(this.scene, this.camera);
				contextInput.clearRect(0, 0, DOM_hexmesh.width, DOM_hexmesh.height);
				contextInput.drawImage(glRenderer.domElement, 0, 0)
				this.camera.layers.disable(surfaceLayer);
				this.camera.layers.disable(meshLayer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});