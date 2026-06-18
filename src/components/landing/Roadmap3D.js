'use client'

import { useEffect, useRef } from 'react'

const Roadmap3D = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    let renderer, scene, camera, tube, milestones, animationId

    const init = async () => {
      const THREE = await import('three')
      const container = containerRef.current
      if (!container) return

      const w = container.clientWidth
      const h = container.clientHeight

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(w, h)
      renderer.setPixelRatio(window.devicePixelRatio)
      container.appendChild(renderer.domElement)

      const points = []
      for (let i = 0; i < 5; i++) {
        points.push(new THREE.Vector3((i - 2) * 1.8, Math.sin(i * 1.5) * 0.3, 0))
      }
      const curve = new THREE.CatmullRomCurve3(points)
      const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.08, 8, false)
      const tubeMat = new THREE.MeshPhongMaterial({
        color: 0x059669,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
      })
      tube = new THREE.Mesh(tubeGeom, tubeMat)
      scene.add(tube)

      const sphereGeom = new THREE.SphereGeometry(0.15, 32, 32)
      const sphereMat = new THREE.MeshPhongMaterial({ color: 0x059669 })
      milestones = []

      points.forEach((p) => {
        const sphere = new THREE.Mesh(sphereGeom, sphereMat)
        sphere.position.copy(p)
        scene.add(sphere)
        milestones.push(sphere)
      })

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
      scene.add(ambientLight)

      const pointLight = new THREE.PointLight(0xffffff, 1)
      pointLight.position.set(5, 5, 5)
      scene.add(pointLight)

      camera.position.z = 5

      const animate = () => {
        animationId = requestAnimationFrame(animate)
        const time = Date.now() * 0.001
        tube.rotation.y = Math.sin(time * 0.5) * 0.1
        tube.position.y = Math.sin(time) * 0.05
        milestones.forEach((m, i) => {
          m.position.y = points[i].y + Math.sin(time + i) * 0.05
          m.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1)
        })
        renderer.render(scene, camera)
      }
      animate()

      const handleResize = () => {
        const cw = container.clientWidth
        const ch = container.clientHeight
        camera.aspect = cw / ch
        camera.updateProjectionMatrix()
        renderer.setSize(cw, ch)
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }

    init()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (renderer && containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer?.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-32 rounded-xl overflow-hidden bg-surface/50 border border-outline-variant/30"
    />
  )
}

export default Roadmap3D
