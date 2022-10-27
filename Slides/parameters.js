import * as THREE from '../CMapJS/Libs/three.module.js';

export const glRenderer = new THREE.WebGLRenderer({
	antialias: true,
	alpha: true});

export const meshEdgeColor = new THREE.Color(0x333333);

export const meshEdgeMaterial = new THREE.LineBasicMaterial({
	color: meshEdgeColor,
	linewidth: 0.9,
	polygonOffset: true,
	polygonOffsetFactor: -0.5
});


export const ambiantLightInt = 0.4;
export const pointLightInt = 0.6;