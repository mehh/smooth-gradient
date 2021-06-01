export default "precision highp float;\n#define GLSLIFY 1\n\n/* https://www.shadertoy.com/view/XsX3zB\n *\n * The MIT License\n * Copyright © 2013 Nikita Miropolskiy\n *\n * ( license has been changed from CCA-NC-SA 3.0 to MIT\n *\n *   but thanks for attributing your source code when deriving from this sample\n *   with a following link: https://www.shadertoy.com/view/XsX3zB )\n *\n * ~\n * ~ if you're looking for procedural noise implementation examples you might\n * ~ also want to look at the following shaders:\n * ~\n * ~ Noise Lab shader by candycat: https://www.shadertoy.com/view/4sc3z2\n * ~\n * ~ Noise shaders by iq:\n * ~     Value    Noise 2D, Derivatives: https://www.shadertoy.com/view/4dXBRH\n * ~     Gradient Noise 2D, Derivatives: https://www.shadertoy.com/view/XdXBRH\n * ~     Value    Noise 3D, Derivatives: https://www.shadertoy.com/view/XsXfRH\n * ~     Gradient Noise 3D, Derivatives: https://www.shadertoy.com/view/4dffRH\n * ~     Value    Noise 2D             : https://www.shadertoy.com/view/lsf3WH\n * ~     Value    Noise 3D             : https://www.shadertoy.com/view/4sfGzS\n * ~     Gradient Noise 2D             : https://www.shadertoy.com/view/XdXGW8\n * ~     Gradient Noise 3D             : https://www.shadertoy.com/view/Xsl3Dl\n * ~     Simplex  Noise 2D             : https://www.shadertoy.com/view/Msf3WH\n * ~     Voronoise: https://www.shadertoy.com/view/Xd23Dh\n * ~\n *\n */\n\n/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */\nvec3 random3(vec3 c) {\n  float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));\n  vec3 r;\n  r.z = fract(512.0*j);\n  j *= .125;\n  r.x = fract(512.0*j);\n  j *= .125;\n  r.y = fract(512.0*j);\n  return r-0.5;\n}\n\n/* skew constants for 3d simplex functions */\nconst float F3 =  0.3333333;\nconst float G3 =  0.1666667;\n\n/* 3d simplex noise */\nfloat simplex3d(vec3 p) {\n   /* 1. find current tetrahedron T and it's four vertices */\n   /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */\n   /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/\n\n   /* calculate s and x */\n   vec3 s = floor(p + dot(p, vec3(F3)));\n   vec3 x = p - s + dot(s, vec3(G3));\n\n   /* calculate i1 and i2 */\n   vec3 e = step(vec3(0.0), x - x.yzx);\n   vec3 i1 = e*(1.0 - e.zxy);\n   vec3 i2 = 1.0 - e.zxy*(1.0 - e);\n\n   /* x1, x2, x3 */\n   vec3 x1 = x - i1 + G3;\n   vec3 x2 = x - i2 + 2.0*G3;\n   vec3 x3 = x - 1.0 + 3.0*G3;\n\n   /* 2. find four surflets and store them in d */\n   vec4 w, d;\n\n   /* calculate surflet weights */\n   w.x = dot(x, x);\n   w.y = dot(x1, x1);\n   w.z = dot(x2, x2);\n   w.w = dot(x3, x3);\n\n   /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */\n   w = max(0.6 - w, 0.0);\n\n   /* calculate surflet components */\n   d.x = dot(random3(s), x);\n   d.y = dot(random3(s + i1), x1);\n   d.z = dot(random3(s + i2), x2);\n   d.w = dot(random3(s + 1.0), x3);\n\n   /* multiply d by w^4 */\n   w *= w;\n   w *= w;\n   d *= w;\n\n   /* 3. return the sum of the four surflets */\n   return dot(d, vec4(52.0));\n}\n\n/* const matrices for 3d rotation */\nconst mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);\nconst mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);\nconst mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);\n\n/* directional artifacts can be reduced by rotating each octave */\nfloat simplex3d_fractal_877222789(vec3 m) {\n    return   0.5333333*simplex3d(m*rot1)\n      +0.2666667*simplex3d(2.0*m*rot2)\n      +0.1333333*simplex3d(4.0*m*rot3)\n      +0.0666667*simplex3d(8.0*m);\n}\n\nvec4 desaturate(vec3 color, float Desaturation)\n{\n  vec3 grayXfer = vec3(0.3, 0.59, 0.11);\n  vec3 gray = vec3(dot(grayXfer, color));\n  return vec4(mix(color, gray, Desaturation), 1.0);\n}\n\n// ---------------------------------------------------------------\n// Levels\n// ---------------------------------------------------------------\n\nvec3 gammaCorrect(vec3 color, float gamma) {\n    return pow(color, vec3(1.0/gamma));\n}\n\nvec3 levelRange(vec3 color, float minInput, float maxInput) {\n    return min(max(color - vec3(minInput), vec3(0.0)) / (vec3(maxInput) - vec3(minInput)), vec3(1.0));\n}\n\nvec3 levels(vec3 color, float minInput, float gamma, float maxInput) {\n    return gammaCorrect(levelRange(color, minInput, maxInput), gamma);\n}\n\nvec3 rgb2hsb( in vec3 c ){\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz),\n                 vec4(c.gb, K.xy),\n                 step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r),\n                 vec4(c.r, p.yzx),\n                 step(p.x, c.r));\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),\n                d / (q.x + e),\n                q.x);\n}\n\nvec3 hsb2rgb( in vec3 c ){\n  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),\n                           6.0)-3.0)-1.0,\n                   0.0,\n                   1.0 );\n  rgb = rgb*rgb*(3.0-2.0*rgb);\n  return c.z * mix(vec3(1.0), rgb, c.y);\n}\n\n// ---------------------------------------------------------------\n// Map to range\n// ---------------------------------------------------------------\n\nfloat map_to_range_1062606552(float inMin, float inMax, float outMin, float outMax, float value) {\n  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;\n}\n\n#ifndef HALF_PI\n#define HALF_PI 1.5707963267948966\n#endif\n\nfloat sineIn(float t) {\n  return sin((t - 1.0) * HALF_PI) + 1.0;\n}\n\n#ifndef HALF_PI\n#define HALF_PI 1.5707963267948966\n#endif\n\nfloat sineOut(float t) {\n  return sin(t * HALF_PI);\n}\n\nfloat quadraticIn(float t) {\n  return t * t;\n}\n\nfloat quadraticOut(float t) {\n  return -t * (t - 2.0);\n}\n\nfloat cubicIn(float t) {\n  return t * t * t;\n}\n\nfloat cubicOut(float t) {\n  float f = t - 1.0;\n  return f * f * f + 1.0;\n}\n\nfloat quarticIn(float t) {\n  return pow(t, 4.0);\n}\n\nfloat quarticOut(float t) {\n  return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;\n}\n\nfloat exponentialIn(float t) {\n  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));\n}\n\nfloat exponentialOut(float t) {\n  return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);\n}\n\nfloat blendAdd(float base, float blend) {\n\treturn min(base+blend,1.0);\n}\n\nvec3 blendAdd(vec3 base, vec3 blend) {\n\treturn min(base+blend,vec3(1.0));\n}\n\nvec3 blendAdd(vec3 base, vec3 blend, float opacity) {\n\treturn (blendAdd(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendAverage(vec3 base, vec3 blend) {\n\treturn (base+blend)/2.0;\n}\n\nvec3 blendAverage(vec3 base, vec3 blend, float opacity) {\n\treturn (blendAverage(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendColorBurn(float base, float blend) {\n\treturn (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);\n}\n\nvec3 blendColorBurn(vec3 base, vec3 blend) {\n\treturn vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));\n}\n\nvec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {\n\treturn (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendColorDodge(float base, float blend) {\n\treturn (blend==1.0)?blend:min(base/(1.0-blend),1.0);\n}\n\nvec3 blendColorDodge(vec3 base, vec3 blend) {\n\treturn vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));\n}\n\nvec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {\n\treturn (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendDarken(float base, float blend) {\n\treturn min(blend,base);\n}\n\nvec3 blendDarken(vec3 base, vec3 blend) {\n\treturn vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));\n}\n\nvec3 blendDarken(vec3 base, vec3 blend, float opacity) {\n\treturn (blendDarken(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendDifference(vec3 base, vec3 blend) {\n\treturn abs(base-blend);\n}\n\nvec3 blendDifference(vec3 base, vec3 blend, float opacity) {\n\treturn (blendDifference(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendExclusion(vec3 base, vec3 blend) {\n\treturn base+blend-2.0*base*blend;\n}\n\nvec3 blendExclusion(vec3 base, vec3 blend, float opacity) {\n\treturn (blendExclusion(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendReflect(float base, float blend) {\n\treturn (blend==1.0)?blend:min(base*base/(1.0-blend),1.0);\n}\n\nvec3 blendReflect(vec3 base, vec3 blend) {\n\treturn vec3(blendReflect(base.r,blend.r),blendReflect(base.g,blend.g),blendReflect(base.b,blend.b));\n}\n\nvec3 blendReflect(vec3 base, vec3 blend, float opacity) {\n\treturn (blendReflect(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendGlow(vec3 base, vec3 blend) {\n\treturn blendReflect(blend,base);\n}\n\nvec3 blendGlow(vec3 base, vec3 blend, float opacity) {\n\treturn (blendGlow(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendOverlay(float base, float blend) {\n\treturn base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend) {\n\treturn vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend, float opacity) {\n\treturn (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendHardLight(vec3 base, vec3 blend) {\n\treturn blendOverlay(blend,base);\n}\n\nvec3 blendHardLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendVividLight(float base, float blend) {\n\treturn (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendVividLight(vec3 base, vec3 blend) {\n\treturn vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));\n}\n\nvec3 blendVividLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendVividLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendHardMix(float base, float blend) {\n\treturn (blendVividLight(base,blend)<0.5)?0.0:1.0;\n}\n\nvec3 blendHardMix(vec3 base, vec3 blend) {\n\treturn vec3(blendHardMix(base.r,blend.r),blendHardMix(base.g,blend.g),blendHardMix(base.b,blend.b));\n}\n\nvec3 blendHardMix(vec3 base, vec3 blend, float opacity) {\n\treturn (blendHardMix(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendLighten(float base, float blend) {\n\treturn max(blend,base);\n}\n\nvec3 blendLighten(vec3 base, vec3 blend) {\n\treturn vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));\n}\n\nvec3 blendLighten(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLighten(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendLinearBurn(float base, float blend) {\n\t// Note : Same implementation as BlendSubtractf\n\treturn max(base+blend-1.0,0.0);\n}\n\nvec3 blendLinearBurn(vec3 base, vec3 blend) {\n\t// Note : Same implementation as BlendSubtract\n\treturn max(base+blend-vec3(1.0),vec3(0.0));\n}\n\nvec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendLinearDodge(float base, float blend) {\n\t// Note : Same implementation as BlendAddf\n\treturn min(base+blend,1.0);\n}\n\nvec3 blendLinearDodge(vec3 base, vec3 blend) {\n\t// Note : Same implementation as BlendAdd\n\treturn min(base+blend,vec3(1.0));\n}\n\nvec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendLinearLight(float base, float blend) {\n\treturn blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendLinearLight(vec3 base, vec3 blend) {\n\treturn vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));\n}\n\nvec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendMultiply(vec3 base, vec3 blend) {\n\treturn base*blend;\n}\n\nvec3 blendMultiply(vec3 base, vec3 blend, float opacity) {\n\treturn (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendNegation(vec3 base, vec3 blend) {\n\treturn vec3(1.0)-abs(vec3(1.0)-base-blend);\n}\n\nvec3 blendNegation(vec3 base, vec3 blend, float opacity) {\n\treturn (blendNegation(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendNormal(vec3 base, vec3 blend) {\n\treturn blend;\n}\n\nvec3 blendNormal(vec3 base, vec3 blend, float opacity) {\n\treturn (blendNormal(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvec3 blendPhoenix(vec3 base, vec3 blend) {\n\treturn min(base,blend)-max(base,blend)+vec3(1.0);\n}\n\nvec3 blendPhoenix(vec3 base, vec3 blend, float opacity) {\n\treturn (blendPhoenix(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendPinLight(float base, float blend) {\n\treturn (blend<0.5)?blendDarken(base,(2.0*blend)):blendLighten(base,(2.0*(blend-0.5)));\n}\n\nvec3 blendPinLight(vec3 base, vec3 blend) {\n\treturn vec3(blendPinLight(base.r,blend.r),blendPinLight(base.g,blend.g),blendPinLight(base.b,blend.b));\n}\n\nvec3 blendPinLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendPinLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendScreen(float base, float blend) {\n\treturn 1.0-((1.0-base)*(1.0-blend));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend) {\n\treturn vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend, float opacity) {\n\treturn (blendScreen(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendSoftLight(float base, float blend) {\n\treturn (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend) {\n\treturn vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendSubtract(float base, float blend) {\n\treturn max(base+blend-1.0,0.0);\n}\n\nvec3 blendSubtract(vec3 base, vec3 blend) {\n\treturn max(base+blend-vec3(1.0),vec3(0.0));\n}\n\nvec3 blendSubtract(vec3 base, vec3 blend, float opacity) {\n\treturn (blendSubtract(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nvarying vec2 vTextureCoord; // The coordinates of the current pixel\nuniform sampler2D uSampler; // The image data\n\nuniform vec2 resolution;\nuniform vec2 mouse;\nuniform float time;\nuniform float noiseIter;\nuniform float xyScalar;\nuniform float noiseOffset;\nuniform bool fractalNoise;\nuniform float blendLow;\nuniform float blendHigh;\n\nuniform vec3 color1;\nuniform vec3 color2;\nuniform vec3 color3;\nuniform vec3 color4;\nuniform vec3 color5;\nuniform vec3 color6;\nuniform vec3 color7;\n\n// Should be moved into uniform\nfloat offsetX = 0.0;\nfloat offsetY = 0.0;\n\n// ---------------------------------------------------------------\n// Get Noise value\n// ---------------------------------------------------------------\n\nfloat get_value(vec2 p, float noiseIter, float scale) {\n  vec3 p3 = vec3(p.x - offsetX + noiseOffset*time, p.y + offsetY + noiseOffset*time, noiseIter * 0.001);\n\n  float value = fractalNoise\n    ? simplex3d_fractal_877222789(p3*(scale * 500.0)+(scale * 500.0))\n    : simplex3d(p3*scale * 1000.0);\n\n  value = 0.5 + 0.5 * value;\n\n  return value;\n}\n\n// ---------------------------------------------------------------\n// Main\n// ---------------------------------------------------------------\n\nvoid main() {\n  float noiseScale = 1500.00;\n  // float mouse_distance = distance(u_mouse, gl_FragCoord.xy);\n  // vec2 uv = gl_FragCoord.xy / resolution;\n  vec2 noise_p = (gl_FragCoord.xy + vec2(offsetX, -offsetY)) / noiseScale;\n\n  float mouseDist = distance(mouse, vTextureCoord);\n  float maxDist = 2000.0;\n  float distPct = mouseDist / maxDist;\n\n  float value_1 = get_value(noise_p, noiseIter, xyScalar / 2.2);\n  float value_2 = get_value(noise_p, noiseIter * 0.8 + 1500.0, xyScalar / 2.3);\n  float value_3 = get_value(noise_p, noiseIter * 0.9 + 3000.0, xyScalar / 1.8);\n  float value_4 = get_value(noise_p, noiseIter * 0.85 + 800.0, xyScalar / 1.4);\n  float value_5 = get_value(noise_p, noiseIter * 0.8 + 1200.0, xyScalar / 1.4);\n\n  vec3 color_black = vec3(0.0, 0.0, 0.0) / 255.0;\n  vec3 color_white = vec3(255.0, 255.0, 255.0) / 255.0;\n  vec3 color_rose = vec3(245.0, 240.0, 58.0) / 255.0;\n  vec3 color_yellow = vec3(245.0, 240.0, 58.0) / 255.0;\n  vec3 color_light_blue = vec3(36.0, 218.0, 217.0) / 255.0;\n  vec3 color_purple = vec3(117.0, 0.0, 154.0) / 255.0;\n  vec3 color_med_blue = vec3(27.0, 102.0, 248.0) / 255.0;\n  vec3 color_dark_blue = vec3(38.0, 46.0, 66.0) / 255.0;\n  vec3 color_dark = vec3(82.0, 56.0, 112.0) / 255.0;\n  vec3 color_steel = vec3(47.0, 79.0, 94.0) / 255.0;\n\n  vec2 modCoords = vec2(\n    vTextureCoord.x + value_1 - 0.5 + map_to_range_1062606552(0.0, 1.0, -0.3, 0.5, distPct),\n    vTextureCoord.y + value_1 - 0.5\n  );\n  vec4 tex = texture2D(uSampler, modCoords);\n\n  vec3 finalColor = vec3(tex.r, tex.g, tex.b);\n\n  // Darken layer\n  finalColor = blendMultiply(finalColor, levels(vec3(value_2), blendLow, 1.0, blendHigh), modCoords.y);\n\n  gl_FragColor = vec4(\n      finalColor,\n      1.0);\n\n  return;\n}\n";
