import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from './Display.js';
import * as Metatron from '../Files/metatron_files.js';
import * as Sculpture from '../Files/sculpture_files.js';
import {loadGraph} from '../CMapJS/IO/GraphFormats/GraphIO.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, meshEdgeColor, meshEdgeMaterial, ambiantLightInt, pointLightInt} from './parameters.js';


export const slide_20plus = new Slide(
	function(DOM_hexmesh)
	{
		this.camera = new THREE.PerspectiveCamera(45, DOM_hexmesh.width / DOM_hexmesh.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 1.6);
		
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

		this.metatronSurface = Display.loadSurfaceView("off", Sculpture.sculpture_off, {transparent: true, opacity: 0.2});
		this.metatronSurface.layers.set(surfaceLayer);
		this.group.add(this.metatronSurface);

		this.metatronVol = Display.loadVolumesView("mesh", Sculpture.sculpture_mesh);
		this.metatronVol.layers.set(meshLayer);
		this.group.add(this.metatronVol);

		const metatronSkel = loadIncidenceGraph('ig', Sculpture.sculpture_ig);
		this.metatronSkel = new Renderer(metatronSkel);
		this.metatronSkel.edges.create({layer: surfaceLayer, material: meshEdgeMaterial, size: 1}).addTo(this.group);
		this.metatronSkel.faces.create({layer: surfaceLayer, side: THREE.DoubleSide}).addTo(this.group);

		// const scale = 0.0075;
		// const offset = -0.36;
		// this.metatronSurface.scale.set(scale,scale,scale);
		// this.metatronSurface.position.set(0,0, offset);
		// this.metatronSkel.edges.mesh.scale.set(scale,scale,scale);
		// this.metatronSkel.edges.mesh.position.set(0,0,offset);
		// this.metatronSkel.faces.mesh.scale.set(scale,scale,scale);
		// this.metatronSkel.faces.mesh.position.set(0,0,offset);
		// this.metatronVol.scale.set(scale,scale,scale);
		// this.metatronVol.position.set(0,0,offset);


		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;
		
		this.toggleClipping = function(){
			this.metatronVol.material.uniforms.clipping.value = 1 - this.metatronVol.material.uniforms.clipping.value;
		};
		this.toggleClipping();
		this.toggleVisible = function(){
			this.metatronVol.visible = !this.metatronVol.visible;
		};

		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};

		this.loop = function(){
			if(this.running){
				glRenderer.setSize(DOM_hexmesh.width, DOM_hexmesh.height);
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 45 * this.time);

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