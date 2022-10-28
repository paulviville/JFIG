import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from '../CMapJS/Utils/Display.js';
import * as Hand from '../Files/hand_files.js';
import * as Cactus from '../Files/cactus_files.js';
import {loadGraph} from '../CMapJS/IO/GraphFormats/GraphIO.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
import {loadCMap2} from '../CMapJS/IO/SurfaceFormats/CMap2IO.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, scafEdgeMaterial, meshEdgeMaterial, ambiantLightInt, pointLightInt} from './parameters.js';



export const slide_Algo1D = new Slide(
	function(DOM_Cactus0, DOM_Cactus1, DOM_Cactus2, DOM_Cactus3, DOM_Cactus4)
	{
		this.camera = new THREE.PerspectiveCamera(75, DOM_Cactus0.width / DOM_Cactus0.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 0.65);
		// this.camera.position.set(0, 0.69, 0.39);
		// this.camera.lookAt(0, 0, 0);

		const surfaceLayer = 0;
		const skelLayer = 1;
		const skelAdLayer = 2;
		const scafLayer = 3;
		const rawLayer = 4;
		const raw2Layer = 5;
		const meshLayer = 6;

		const contextCactus0 = DOM_Cactus0.getContext('2d');
		const contextCactus1 = DOM_Cactus1.getContext('2d');
		const contextCactus2 = DOM_Cactus2.getContext('2d');
		const contextCactus3 = DOM_Cactus3.getContext('2d');
		const contextCactus4 = DOM_Cactus4.getContext('2d');

		const controlsCactus0 = new OrbitControls(this.camera, DOM_Cactus0);
		const controlsCactus1 = new OrbitControls(this.camera, DOM_Cactus1);
		const controlsCactus2 = new OrbitControls(this.camera, DOM_Cactus2);
		const controlsCactus3 = new OrbitControls(this.camera, DOM_Cactus3);
		const controlsCactus4 = new OrbitControls(this.camera, DOM_Cactus4);

		this.scene = new THREE.Scene()
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiantLightInt);
		const pointLight = new THREE.PointLight(0xFFFFFF, pointLightInt);
		pointLight.position.set(10,8,15);

		ambiantLight.layers.enable(surfaceLayer);
		pointLight.layers.enable(surfaceLayer);
		ambiantLight.layers.enable(skelLayer);
		pointLight.layers.enable(skelLayer);
		ambiantLight.layers.enable(scafLayer);
		pointLight.layers.enable(scafLayer);
		ambiantLight.layers.enable(rawLayer);
		pointLight.layers.enable(rawLayer);
		ambiantLight.layers.enable(meshLayer);
		pointLight.layers.enable(meshLayer);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		this.cactusSurface = Display.loadSurfaceView("off", Cactus.cactus_off, {transparent: true, opacity: 0.3});
		this.cactusSurface.layers.set(surfaceLayer);
		this.group.add(this.cactusSurface);

		const cactusSkel = loadGraph('cg', Cactus.cactus_cg);
		this.cactusSkel = new Renderer(cactusSkel);
		this.cactusSkel.edges.create({layer: skelLayer, material: meshEdgeMaterial, size: 2}).addTo(this.group);

		const cactusAdSkel = loadGraph('cg', Cactus.cactus_simplified_cg);
		this.cactusAdSkel = new Renderer(cactusAdSkel);
		this.cactusAdSkel.edges.create({layer: skelAdLayer, material: meshEdgeMaterial, size: 2}).addTo(this.group);
		this.cactusAdSkel.vertices.create({layer: skelAdLayer, size:0.01, color: new THREE.Color(0.2, 0.8, 0.2)}).addTo(this.group);


		const cactusScaf = loadCMap2('off', Cactus.cactus_scaffold_off);
		this.cactusScaf = new Renderer(cactusScaf);
		this.cactusScaf.edges.create({layer: scafLayer, material: scafEdgeMaterial, size: 2.5}).addTo(this.group);


		// this.handVol = Display.load_volumes_view("mesh", holes_mesh);
		this.cactusRawVol = Display.loadVolumesView("mesh", Cactus.cactus0_mesh);
		this.cactusRawVol.layers.set(rawLayer);
		this.group.add(this.cactusRawVol);


		this.cactusMesh = Display.loadVolumesView("mesh", Cactus.cactus_mesh);
		this.cactusMesh.layers.set(meshLayer);
		this.group.add(this.cactusMesh);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;

		this.on = 1;
		this.pause = function(){
			this.on = 1 - this.on;
		};

		this.loop = function(){
			if(this.running){
				glRenderer.setSize(DOM_Cactus0.width, DOM_Cactus0.height);
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 90 * this.time);
				
				this.camera.layers.enable(skelLayer);
				glRenderer.render(this.scene, this.camera);
				contextCactus0.clearRect(0, 0, DOM_Cactus0.width, DOM_Cactus0.height);
				contextCactus0.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(skelLayer);

				this.camera.layers.enable(skelAdLayer);
				glRenderer.render(this.scene, this.camera);
				contextCactus1.clearRect(0, 0, DOM_Cactus1.width, DOM_Cactus1.height);
				contextCactus1.drawImage(glRenderer.domElement, 0, 0);

				this.camera.layers.enable(scafLayer);
				glRenderer.render(this.scene, this.camera);
				contextCactus2.clearRect(0, 0, DOM_Cactus2.width, DOM_Cactus2.height);
				contextCactus2.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(scafLayer);

				this.camera.layers.enable(rawLayer);
				glRenderer.render(this.scene, this.camera);
				contextCactus3.clearRect(0, 0, DOM_Cactus3.width, DOM_Cactus3.height);
				contextCactus3.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(rawLayer);
				this.camera.layers.disable(skelAdLayer);

				this.camera.layers.enable(meshLayer);
				glRenderer.render(this.scene, this.camera);
				contextCactus4.clearRect(0, 0, DOM_Cactus4.width, DOM_Cactus4.height);
				contextCactus4.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(meshLayer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});