import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import * as Display from './Display.js';
import * as Dilo from '../Files/dilo_files.js';
import * as Hand from '../Files/hand_files.js';
import * as Holes from '../Files/holes_files.js';
import * as TorusTwist from '../Files/torusTwist.js';
import * as VertTurbine from '../Files/vertTurbine.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, meshEdgeColor, meshEdgeMaterial, ambiantLightInt, pointLightInt} from './parameters.js';
import { torusTwist_regularity_ig, vertTurbine_regularity3_ig, vertTurbine_regularity_ig } from '../Files/regularity.js';


const vertTurbineRegGraph = loadIncidenceGraph("ig", vertTurbine_regularity_ig)
const vertTurbineRegGraph3 = loadIncidenceGraph("ig", vertTurbine_regularity3_ig)

const torusTwistRegGraph = loadIncidenceGraph("ig", torusTwist_regularity_ig)


export const slide_results2 = new Slide(
	function(DOM_Torus, DOM_Turbine)
	{
		this.camera0 = new THREE.PerspectiveCamera(45, DOM_Torus.width / DOM_Torus.height, 0.1, 1000.0);
		this.camera0.position.set(0, 4, 1.3);
		this.camera1 = new THREE.PerspectiveCamera(45, DOM_Turbine.width / DOM_Turbine.height, 0.1, 1000.0);
		this.camera1.position.set(0, 2, 5);
		
		const handLayer = 1;
		const diloLayer = 2;

		const context_input = DOM_Torus.getContext('2d');
		const context_output = DOM_Turbine.getContext('2d');

		const orbit_controls_input = new OrbitControls(this.camera0, DOM_Torus);
		const orbit_controls_output = new OrbitControls(this.camera1, DOM_Turbine);

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
		this.turbineGroup = new THREE.Group;
		this.group.add(this.turbineGroup)

		this.dilo_surface = Display.loadSurfaceView("off", TorusTwist.torusTwistOFF, {transparent: true, opacity: 0.3});
		this.dilo_surface.layers.set(diloLayer);
		this.group.add(this.dilo_surface);

		this.hand_surface = Display.loadSurfaceView("off", VertTurbine.vertTurbineOFF, {transparent: true, opacity: 0.3});
		this.hand_surface.layers.set(handLayer);
		this.turbineGroup.add(this.hand_surface);

		const hand_skel = loadIncidenceGraph('ig', VertTurbine.vertTurbineIG);
		this.hand_skel = new Renderer(hand_skel);
		this.hand_skel.edges.create({layer: handLayer, material: meshEdgeMaterial}).addTo(this.turbineGroup);
		this.hand_skel.faces.create({layer: handLayer, side: THREE.DoubleSide}).addTo(this.turbineGroup);


		const dilo_skel = loadIncidenceGraph('ig', TorusTwist.torusTwistIG);
		this.dilo_skel = new Renderer(dilo_skel);
		this.dilo_skel.edges.create({layer: diloLayer, material: meshEdgeMaterial}).addTo(this.group);
		this.dilo_skel.faces.create({layer: diloLayer, side: THREE.DoubleSide}).addTo(this.group);


		this.hand_vol = Display.loadVolumesView("mesh", VertTurbine.vertTurbineMESH);
		this.hand_vol.layers.set(handLayer);
		// this.hand_vol.position.set(0, -1.8, 0)
		this.turbineGroup.add(this.hand_vol);

		this.turbineGroup.position.set(0, -1.8, 0);
		
		this.dilo_vol = Display.loadVolumesView("mesh", TorusTwist.torusTwistMESH);
		this.dilo_vol.layers.set(diloLayer);
		this.group.add(this.dilo_vol);






		const vertTurbineRegGraphs = new THREE.Group();
		const vertTurbineReg = new Renderer(vertTurbineRegGraph);
		const vertTurbineReg3 = new Renderer(vertTurbineRegGraph3);
		// const vertTurbineReg5 = new Renderer(vertTurbineRegGraph5);
		vertTurbineReg.edges.create({
			layer: handLayer,
			size: 6,
			color: new THREE.Color(0x0000ff)
		});
		vertTurbineReg.edges.addTo(vertTurbineRegGraphs)
		vertTurbineReg3.edges.create({
			layer: handLayer,
			size: 6,
			color: new THREE.Color(0xff0000)
		});
		vertTurbineReg3.edges.addTo(vertTurbineRegGraphs)
		// handReg5.edges.create({
		// 	layer: handLayer,
		// 	size: 3,
		// 	color: new THREE.Color(0x00ff00)
		// });
		// handReg5.edges.addTo(vertTurbineRegGraphs)
		this.group.add(vertTurbineRegGraphs)
		vertTurbineRegGraphs.visible = false;
		vertTurbineRegGraphs.position.set(0, -1.8, 0);

		const torusTwistRegGraphs = new THREE.Group();
		const torusTwistReg = new Renderer(torusTwistRegGraph);
		// const torusTwistReg3 = new Renderer(torusTwistRegGraph3);
		// const torusTwistReg5 = new Renderer(torusTwistRegGraph5);
		torusTwistReg.edges.create({
			layer: diloLayer,
			size:5,
			color: new THREE.Color(0x0000ff)
		});
		torusTwistReg.edges.addTo(torusTwistRegGraphs)
		
		// torusTwistReg3.edges.create({
		// 	layer: diloLayer,
		// 	size: 1.5,
		// 	color: new THREE.Color(0xff0000)
		// });
		// torusTwistReg3.edges.addTo(torusTwistRegGraphs)
		// torusTwistReg5.edges.create({
		// 	layer: diloLayer,
		// 	size: 1.5,
		// 	color: new THREE.Color(0x00ff00)
		// });
		// torusTwistReg5.edges.addTo(torusTwistRegGraphs)
		this.group.add(torusTwistRegGraphs)
		torusTwistRegGraphs.visible = false;








		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;





		
		this.toggle_clipping = function(){
			this.hand_vol.material.uniforms.clipping.value = 1 - this.hand_vol.material.uniforms.clipping.value;
			this.dilo_vol.material.uniforms.clipping.value = 1 - this.dilo_vol.material.uniforms.clipping.value;
			torusTwistRegGraphs.visible = !torusTwistRegGraphs.visible;
			vertTurbineRegGraphs.visible = !vertTurbineRegGraphs.visible;

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

		const offsetAngleDilo = Math.PI /2;
		const offsetAxisDilo = new THREE.Vector3(0, 0, 1);
		this.dilo_surface.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);
		this.dilo_skel.edges.mesh.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);
		this.dilo_skel.faces.mesh.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);
		this.dilo_vol.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);
		// vertTurbineRegGraphs.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);
		torusTwistRegGraphs.setRotationFromAxisAngle(offsetAxisDilo, offsetAngleDilo);

		// const offsetAngleHand = Math.PI/2;
		// const offsetAxisHand = new THREE.Vector3(0, 0.3, -10);
		// this.hand_surface.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		// this.hand_vol.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		// this.hand_surface.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		// this.hand_skel.edges.mesh.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);
		// this.hand_skel.faces.mesh.setRotationFromAxisAngle(offsetAxisHand, offsetAngleHand);

		this.hand_vol.visible = false ;
		this.dilo_vol.visible = false;
		this.dilo_surface.visible = true;
		this.hand_skel.edges.mesh.visible = true;
		this.dilo_skel.edges.mesh.visible = true;
		this.hand_skel.faces.mesh.visible = true;
		this.dilo_surface.material.side = THREE.BackSide;
		this.hand_surface.material.side = THREE.BackSide;

		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta() * this.on;
				this.group.setRotationFromAxisAngle(axis, Math.PI / 45 * this.time);

				this.camera0.layers.enable(diloLayer);
				glRenderer.setSize(DOM_Torus.width, DOM_Torus.height);
				glRenderer.render(this.scene, this.camera0);
				context_input.clearRect(0, 0, DOM_Torus.width, DOM_Torus.height);
				context_input.drawImage(glRenderer.domElement, 0, 0)
				this.camera0.layers.disable(diloLayer);

				this.camera1.layers.enable(handLayer);
				glRenderer.setSize(DOM_Turbine.width, DOM_Turbine.height);
				glRenderer.render(this.scene, this.camera1);
				context_output.clearRect(0, 0, DOM_Turbine.width, DOM_Turbine.height);
				context_output.drawImage(glRenderer.domElement, 0, 0);
				this.camera1.layers.disable(handLayer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});