#define AA 2
precision highp float;
uniform vec2 iResolution;
uniform vec3 ro; // Camera origin
uniform vec3 dir; // Camera direction
uniform vec3 cp; // Camera rotation
uniform float world; // Current world
uniform float time; // Universal time

#define EPS 0.001
#define PI 3.14159265359

struct material {
    vec3 colour;
    float ka; // Ambient, the ratio of reflection of the ambient term
    float kd; // Diffuse, the ratio of reflection of the diffuse term of incoming light
    float ks; // Specular, the ratio of reflection of the specular term of incoming light
    float al; // Shininess, larger for surfaces that are smoother and more mirror-like
    int t;  // Texture // {-1: none, -2: emmissive, 0..inf: texture}
};

struct fMat {
    float f;
    vec3 nor;
    material mat;
};

material materials[6];

void initMaterials() {
    materials[0] = material(
        vec3(1.0, 1.0, 1.0),
        0.01,
        0.8,
        0.05,
        1.0,
        0);
    materials[1] = material(
        vec3(1.0, 1.0, 1.0),
        0.01,
        0.8,
        0.05,
        1.0,
        -1);
    materials[2] = material(
        vec3(0.01, 0.01, 1.0),
        0.01,
        0.8,
        0.05,
        1.0,
        -1);
    materials[3] = material(
        vec3(0.01, 0.01, 0.01),
        0.01,
        0.8,
        0.05,
        1.0,
        -1);
    materials[4] = material(
        vec3(1.0, 1.0, 1.0),
        0.05,
        0.8,
        0.1,
        1.0,
        -1);
    materials[5] = material(
        vec3(1.0, 1.0, 1.0),
        1.0,
        1.0,
        1.0,
        1.0,
        -2);
}

vec3 hexTexture( in vec2 p, in float r ){
    float sdf = 1e10;
    const vec3 k = vec3(-0.866025404,0.5,0.577350269);
    p = mod(p+r*2.0,vec2(-k.x*4.0*r,4.0*r))-(r*2.0);
    vec2 q = abs(p);
    q -= 2.0*min(dot(k.xy,q),0.0)*k.xy;
    q -= vec2(clamp(q.x, -k.z*r, k.z*r), r);
    sdf = min(length(q)*sign(q.y),sdf);
    q = abs(p-vec2(k.x*2.0*r,r));
    q -= 2.0*min(dot(k.xy,q),0.0)*k.xy;
    q -= vec2(clamp(q.x, -k.z*r, k.z*r), r);
    sdf = min(length(q)*sign(q.y),sdf);
    q = abs(p-vec2(-k.x*2.0*r,-r));
    q -= 2.0*min(dot(k.xy,q),0.0)*k.xy;
    q -= vec2(clamp(q.x, -k.z*r, k.z*r), r);
    sdf = min(length(q)*sign(q.y),sdf);
    q = abs(p-vec2(k.x*2.0*r,-r));
    q -= 2.0*min(dot(k.xy,q),0.0)*k.xy;
    q -= vec2(clamp(q.x, -k.z*r, k.z*r), r);
    sdf = min(length(q)*sign(q.y),sdf);
    q = abs(p-vec2(-k.x*2.0*r,r));
    q -= 2.0*min(dot(k.xy,q),0.0)*k.xy;
    q -= vec2(clamp(q.x, -k.z*r, k.z*r), r);
    sdf = min(length(q)*sign(q.y),sdf);
    q = abs(p-vec2(0,-2.0*r));
    q -= 2.0*min(dot(k.xy,q),0.0)*k.xy;
    q -= vec2(clamp(q.x, -k.z*r, k.z*r), r);
    sdf = min(length(q)*sign(q.y),sdf);
    q = abs(p-vec2(0,2.0*r));
    q -= 2.0*min(dot(k.xy,q),0.0)*k.xy;
    q -= vec2(clamp(q.x, -k.z*r, k.z*r), r);
    sdf = min(length(q)*sign(q.y),sdf);
    return vec3(max(1.0 - exp(-32.0*abs(sdf)), 0.0));
}
vec3 brickTexture( in vec2 p, in vec2 b ){
    float sdf = 1e10;
    p = mod(p+b,vec2(2.0*b.x,4.0*b.y))-b;
    vec2 d = abs(p)-b;
    sdf = min(sdf, length(max(d,0.0)) + min(max(d.x,d.y),0.0));
    d = abs(vec2(p.x-2.0*b.x,p.y))-b;
    sdf = min(sdf, length(max(d,0.0)) + min(max(d.x,d.y),0.0));
    d = abs(vec2(p.x-1.0*b.x,p.y-2.0*b.y))-b;
    sdf = min(sdf, length(max(d,0.0)) + min(max(d.x,d.y),0.0));
    d = abs(vec2(p.x-3.0*b.x,p.y-2.0*b.y))-b;
    sdf = min(sdf, length(max(d,0.0)) + min(max(d.x,d.y),0.0));
    d = abs(vec2(p.x+1.0*b.x,p.y-2.0*b.y))-b;
    sdf = min(sdf, length(max(d,0.0)) + min(max(d.x,d.y),0.0));
    return vec3(max(1.0 - exp(-32.0*abs(sdf)), 0.0));
}
vec3 hexTextureTriPlane(in vec4 pos, in vec3 n, in float k, in float r) {
    vec3 m = pow( abs(n), vec3(k) );
    vec3 x = brickTexture(pos.zy, vec2(2.0*r, r));
    vec3 y = hexTexture(pos.zx, r);
    vec3 z = brickTexture(pos.xy, vec2(2.0*r, r));
    return (x*m.x + y*m.y + z*m.z).xyz / (m.x + m.y + m.z);
}

float spfSDF(vec3 p, float s){
  return length(p)-s;
}

float boxSDF(vec3 p, vec3 b){
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float chartSDF(in vec4 pos){
    float d = 1e10;
#define ATLAS_SDF 0.0
    return d;
}

fMat U(fMat d1, fMat d2) {
    if (d2.f < d1.f && d2.f > -EPS){
        return d2;
    } else {
        return d1;
    }
}

float sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, in float ra, out vec3 nor, out float ss){
    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;
    float d = -ra + sqrt(max(0.0,ra*ra-h));
    float t = -b  - sqrt( max(0.0,h) );

    ss = (t < 0.0) ? 1.0 : smoothstep(0.0, 1.0, 32.0*d/t );

    if(h < 0.0) return 1e10; // no intersection
    nor = ((ro+t*rd) - ce)/ra;
    return t;
}

float segShadow( in vec3 ro, in vec3 rd, in vec3 pa, float sh ){
    float dm = dot(rd.yz,rd.yz); // dm = 1.0 - rd.x*rd.x
    float k1 = (ro.x-pa.x)*dm;
    float k2 = (ro.x+pa.x)*dm;
    vec2  k5 = (ro.yz+pa.yz)*dm;
    float k3 = dot(ro.yz+pa.yz,rd.yz);
    vec2  k4 = (pa.yz+pa.yz)*rd.yz;
    vec2  k6 = (pa.yz+pa.yz)*dm;
    
    for( float i=0.; i<4.0; i+=1.0 ){
        vec2  s = vec2(mod(i,2.0),floor(i/2.0));
        float t = dot(s,k4) - k3;
        vec3 v = vec3(clamp(-rd.x*t,k1,k2),k5-k6*s)+rd*t;
        if( t>0.0 ) sh = min(sh, dot(v,v)/(t*t));
    }
    return sh;
}

vec2 boxIntersect( in vec3 ro, in vec3 rd, in vec3 ce, in vec3 sz, out vec3 nor, out float ss) {
    vec3 roo = ro.xyz - ce;
    vec3 m = 1.0/rd;
    vec3 n = m*roo;
    vec3 k = abs(m)*sz;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
  
    nor = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
    ss = 1.0;
    if( tN < tF && tF>0.0){
        ss = 1.0;
    } else if( tN > tF || tF<0.0) {
        ss = segShadow( ro.xyz, rd.xyz, sz.xyz, ss );
        ss = segShadow( ro.yzx, rd.yzx, sz.yzx, ss );
        ss = segShadow( ro.zxy, rd.zxy, sz.zxy, ss );
        ss = clamp(8.0*sqrt(ss),0.0,1.0);
        ss = ss*ss*(3.0-2.0*ss);
    }
    ss=1.0;

    if( tN > tF || tF < 0.0) return vec2(1e10);
    return vec2(tN, tF);
}


vec2 roomIntersect( in vec3 ro, in vec3 rd, in vec3 ce, in vec3 sz, out vec3 nor, out float ss) {
    vec3 roo = ro.xyz - ce;
    vec3 m = 1.0/rd;
    vec3 n = m*roo;
    vec3 k = abs(m)*sz;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );

    ss = 1.0;
    if( tN > tF || tF < 0.0) return vec2(1e10);
    nor = -sign(rd)*step(t2.xyz,t2.yzx)*step(t2.xyz,t2.zxy);
    return vec2(tN, tF);
}

fMat chartIntersect(in vec4 pos, in vec3 rd, inout float ss){
    fMat d = fMat(1e10, vec3(0,0,0), materials[0]);
    vec3 nor;
    float f, stmp;
#define ATLAS_INTERSECT 0.0
    return d;
}

fMat map(in vec4 pos, in vec4 ro, in vec3 rd, in bool teleported, inout float ss){
    fMat d = chartIntersect(pos, rd, ss);
    vec3 nor;
    if(abs(pos.w-ro.w)<EPS && teleported){
        float stmp;
        float f = sphIntersect(pos.xyz, rd, ro.xyz, 0.25, nor, stmp);
        ss = min(ss, stmp);
        d = U(d, fMat(f, nor, materials[3]));
    }
    return d;
}

bool rayRectIntersect(in vec4 x0, in vec3 x1, in vec3 x2, in vec3 x3, in vec3 x4){
    float u = dot(x0.xyz-x1, x2-x1);
    float v = dot(x0.xyz-x1, x3-x1);
    float d = dot(normalize(x4-x1), x0.xyz-x1);
    return u >= 0.0 && u <= dot(x2-x1,x2-x1) && v >= 0.0 && v <= dot(x3-x1,x3-x1) && abs(d) < EPS;
}

bool teleport(inout vec4 pos, inout vec3 rd){
    vec3 p1, p2, p3, p4;
#define TELEPORT 0.0
    return false;
}

#define ITER 64
vec4 raymarch(in vec4 ro, inout vec3 rd, out fMat hm, in int max_tele, inout float ss){
    int tele = 0;
    vec4 pos = ro;
    for( int i=0; i<ITER; i++ ){
        hm = map(pos, ro, rd, tele > 0, ss);
        pos.xyz += hm.f*rd;
        if (++tele > max_tele || !teleport(pos,rd)) break;
    }
    return pos;
}

vec3 evaluateTexture(in vec4 pos, in vec3 n, in material mat){
    if (mat.t==0) return mat.colour*hexTextureTriPlane(pos, n, 5.0, 0.25);
    return mat.colour;
}

struct pointLight {
    float id;
    float is;
    float ia;
    float iattl;
    float iattq;
    vec3 colour;
    vec4 pos;
};

vec3 pointLightPhong(in vec4 pos, in vec3 xyz, in vec3 n, in vec3 v, in pointLight light, in material mat){
    // pos: fragment to be shaded in atlas space
    // xyz: fragment to be shaded in the light's chart space
    vec3 lm = normalize(light.pos.xyz - xyz);
    vec3 nlm = -lm;

    // Shading
    vec3 rm = 2.0*dot(lm,n)*n-lm;
    vec3 h = normalize(lm+v);
    float ip = (mat.kd*max(dot(lm,n),0.0)*light.id) + (mat.ks*pow(max(dot(rm,v),0.0),mat.al)*light.is);

    // Shadows
    float ss = 1.0; fMat hm;
    vec4 vpos = raymarch(light.pos, nlm, hm, 1, ss);
    float ssm = (vpos.w-pos.w < EPS && (length(vpos.xyz - pos.xyz) < 0.01 ))?ss:0.0;
    float la  = length(light.pos.xyz - xyz);
    return light.colour*(light.ia*mat.ka + ssm*ip/(1.0 + light.iattl*la + light.iattq*la*la));
}

vec3 phong(in vec4 pos, in vec3 n, in vec3 v, in material mat){
    // pointlight parameters
    vec3 xyz;
    vec3 icol;
    float ia;
    float id;
    float is;
    float attn;
    // Temp vars
    vec3 lm;
    vec4 vpos;
    float la, id2, sn, ia2, ip, ss;
    fMat hm;
    // Consts
    vec3 mat_col = evaluateTexture(pos, n, mat);
    vec3 col = vec3(0);

#define LIGHTING 0.0

    if (mat.t == -2) col = mat_col; // Emmissive material
    return col;
}

vec3 render( in vec3 ro, in vec3 rd){
    vec3 col = vec3(0.3, 0.3, 0.3);
    fMat hm;
    float ss = -1.0;
    vec4 pos = raymarch(vec4(ro, world), rd, hm, 64, ss);
    // NOTE: Ray direction modified during teleport
    col = phong(pos, hm.nor, -rd, hm.mat);
    return vec3( clamp(col,0.0,1.0) );
}

mat3 setCamera(in vec3 ro, in vec3 cw, in vec3 cp) {
    vec3 cu = normalize( cross(cw,cp) );
    vec3 cv =          ( cross(cu,cw) );
    return mat3( cu, cv, cw );
}

void main() {
    initMaterials();
    mat3 ca = setCamera( ro, dir, cp );
    vec3 tot = vec3(0.0);
    for( int m=0; m<AA; m++ )
    for( int n=0; n<AA; n++ ) {
        // pixel coordinates
        vec2 o = vec2(EPS, EPS) + vec2(float(n),float(m)) / float(AA) - 0.5;
        vec2 p = (2.0*(gl_FragCoord.xy+o)-iResolution.xy)/iResolution.y;

        // focal length
        const float fl = 2.5;
        
        // ray direction
        vec3 rd = ca * normalize( vec3(p,fl) );

        // ray differentials
        //vec2 px = (2.0*(gl_FragCoord.xy+vec2(1.0,0.0))-iResolution.xy)/iResolution.y;
        //vec2 py = (2.0*(gl_FragCoord.xy+vec2(0.0,1.0))-iResolution.xy)/iResolution.y;
        //vec3 rdx = ca * normalize(vec3(px,fl));
        //vec3 rdy = ca * normalize(vec3(py,fl));
        
        // render   
        vec3 col = render(ro, rd);//, rdx, rdy );
        
        // gamma
        col = pow( col, vec3(0.4545) );

        tot += col;
    }
    tot /= float(AA*AA);
    
    gl_FragColor = vec4( tot, 1.0 );
}