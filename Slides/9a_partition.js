import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import RendererSpherical from '../CMapJS/Rendering/RendererSpherical.js';
import * as Display from '../CMapJS/Utils/Display.js';
import * as Hand from '../Files/hand_files.js';
import * as SP from '../Files/sphere_partition_files.js';
import {loadIncidenceGraph} from '../CMapJS/IO/IncidenceGraphFormats/IncidenceGraphIO.js';
import {loadGraph} from '../CMapJS/IO/GraphFormats/GraphIO.js';
import {loadCMap2} from '../CMapJS/IO/SurfaceFormats/CMap2IO.js';
import {Clock} from '../CMapJS/Libs/three.module.js';

import {glRenderer, scafEdgeMaterial, meshEdgeMaterial, ambiantLightInt, pointLightInt} from './parameters.js';


const sphere_mat = new THREE.MeshLambertMaterial({color: 0xEEEEEE, transparent: true, opacity: 0.850});
const sphere_geom = new THREE.SphereGeometry( 0.995, 64, 64 );
const cylinder_geometry = new THREE.CylinderGeometry(0.0125, 0.0125, 1, 20);
const cylinder_material = new THREE.MeshBasicMaterial({
	color: new THREE.Color(0x333333),
});
const point_geom = new THREE.SphereGeometry( 0.05, 16, 16 );
const point_geom2 = new THREE.SphereGeometry( 0.18, 16, 16 );
const point_mat = new THREE.MeshLambertMaterial({color: 0xFF0000});
const point_mat2 = new THREE.MeshLambertMaterial({color: 0x0055DD});

function create_branching_point(graph, layer = 0, center_layer ){
	const vertex = graph.vertex;
	const edge = graph.edge;
	const position = graph.getAttribute(vertex, "position");
	const branching_point = new THREE.Group;
	const edges = new THREE.Group;
	graph.foreach(edge, ed => {
		let cylinder = new THREE.Mesh(cylinder_geometry, cylinder_material);
		cylinder.layers.set(center_layer == undefined? layer : center_layer);
		let p0 = position[graph.cell(vertex, ed)];
		let p1 = position[graph.cell(vertex, graph.alpha0[ed])];
		let dir = new THREE.Vector3().subVectors(p0, p1).multiplyScalar(1.2);

		let len = dir.length();
		let mid = new THREE.Vector3().addVectors(p0, p1).divideScalar(2);

		let dirx = new THREE.Vector3().crossVectors(dir.normalize(), new THREE.Vector3(-0.01,0.01,1).normalize());
		let dirz = new THREE.Vector3().crossVectors(dirx, dir);

		let m = new THREE.Matrix4().fromArray([
			dirx.x, dir.x, dirz.x, mid.x,
			dirx.y, dir.y, dirz.y, mid.y,
			dirx.z, dir.z, dirz.z, mid.z,
			0, 0, 0, 1]).transpose();
		cylinder.applyMatrix4(m);
		cylinder.scale.set(2, len, 2);
		edges.add(cylinder);
	});

	const points = new THREE.Group;
	graph.foreach(vertex, vd => {
		let point;
		let deg = 0;
		graph.foreachDartOf(vertex, vd, d => {++deg; });

		if(deg > 1){
			let center_point = new THREE.Mesh(point_geom2, point_mat2);
			center_point.position.copy(position[graph.cell(vertex, vd)]);
			center_point.layers.set(center_layer == undefined? layer : center_layer);
			branching_point.add(center_point);
		}
		else{
			point = new THREE.Mesh(point_geom, point_mat);

			point.position.copy(position[graph.cell(vertex, vd)]);
			point.layers.set(layer);
			points.add(point);
		}
		
	});

	branching_point.add(points);
	branching_point.add(edges);
	return branching_point;
}

export const slide_partition = new Slide(
	function(DOM_init, DOM_points, DOM_raw, DOM_remesh, DOM_dual, DOM_result){
		const points_layer = 0;
		const raw_layer = 1;
		const remesh_layer = 2;
		const dual_layer = 3;
		const skel_layer = 4;

		const context_init = DOM_init.getContext('2d');
		const context_points = DOM_points.getContext('2d');
		const context_raw = DOM_raw.getContext('2d');
		const context_remesh = DOM_remesh.getContext('2d');
		const context_dual = DOM_dual.getContext('2d');
		const context_result = DOM_result.getContext('2d');

		this.camera = new THREE.PerspectiveCamera(75, DOM_result.width / DOM_result.height, 0.1, 1000.0);
		this.camera.position.set(0, 0, 1.8);

		let orbit_controls00  = new OrbitControls(this.camera, DOM_init);
		let orbit_controls0  = new OrbitControls(this.camera, DOM_points);
		let orbit_controls1  = new OrbitControls(this.camera, DOM_raw);
		let orbit_controls2  = new OrbitControls(this.camera, DOM_remesh);
		let orbit_controls3  = new OrbitControls(this.camera, DOM_dual);
		let orbit_controls4  = new OrbitControls(this.camera, DOM_result);

		let sphere_graph = loadGraph('cg', SP.branches_cg);
		let sphere_raw = loadCMap2("off", SP.delaunay_raw_off);
		let sphere_remesh = loadCMap2("off", SP.delaunay_remeshed_off);
		let sphere_dual = loadCMap2("off", SP.dual_off);


		this.scene = new THREE.Scene();
		let ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiantLightInt);
		let pointLight = new THREE.PointLight(0xFFFFFF, pointLightInt);
		pointLight.position.set(10,8,15);
		this.scene.add(ambiantLight);
		this.scene.add(pointLight);

		this.group = new THREE.Group;
		this.scene.add(this.group);

		let sphere =  new THREE.Mesh(sphere_geom, sphere_mat);
		this.group.add(sphere);

		let points = create_branching_point(sphere_graph, points_layer, skel_layer);
		this.group.add(points);

		let branching_point_renderer = new Renderer(sphere_graph);
		branching_point_renderer.edges.create({layer: points_layer, material: meshEdgeMaterial}).addTo(this.group);

		let raw_delaunay_renderer = new RendererSpherical(sphere_raw);
		raw_delaunay_renderer.geodesics.create({layer: raw_layer, color: 0x0011FF}).addTo(this.group);

		let remeshed_delaunay_renderer = new RendererSpherical(sphere_remesh);
		remeshed_delaunay_renderer.geodesics.create({layer: remesh_layer, color: 0x11BB44}).addTo(this.group);

		let dual_renderer = new RendererSpherical(sphere_dual);
		dual_renderer.geodesics.create({layer: dual_layer, color: 0xFF2222}).addTo(this.group);

		const axis = new THREE.Vector3(0, 1, 0);
		this.clock = new Clock(true);
		this.time = 0;
		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta();
				this.group.setRotationFromAxisAngle(axis, Math.PI / 60 * this.time);

				this.camera.layers.enable(skel_layer);
				this.camera.layers.disable(points_layer);
				glRenderer.setSize(DOM_points.width, DOM_points.height);
				glRenderer.render(this.scene, this.camera);
				context_init.clearRect(0, 0, DOM_init.width, DOM_init.height);
				context_init.drawImage(glRenderer.domElement, 0, 0);

				this.camera.layers.enable(points_layer);

				glRenderer.render(this.scene, this.camera);
				context_points.clearRect(0, 0, DOM_points.width, DOM_points.height);
				context_points.drawImage(glRenderer.domElement, 0, 0);

				this.camera.layers.enable(raw_layer);
				glRenderer.render(this.scene, this.camera);
				context_raw.clearRect(0, 0, DOM_raw.width, DOM_raw.height);
				context_raw.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(raw_layer);

				this.camera.layers.enable(remesh_layer);
				glRenderer.render(this.scene, this.camera);
				context_remesh.clearRect(0, 0, DOM_remesh.width, DOM_remesh.height);
				context_remesh.drawImage(glRenderer.domElement, 0, 0);

				this.camera.layers.enable(dual_layer);
				glRenderer.render(this.scene, this.camera);
				context_dual.clearRect(0, 0, DOM_dual.width, DOM_dual.height);
				context_dual.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(remesh_layer);

				glRenderer.render(this.scene, this.camera);
				context_result.clearRect(0, 0, DOM_result.width, DOM_result.height);
				context_result.drawImage(glRenderer.domElement, 0, 0);
				this.camera.layers.disable(dual_layer);

				requestAnimationFrame(this.loop.bind(this));
			}
		}

	}
);