
export function computeTimeAspect(rental, car) {
    return rental.duration * car.price_per_day;
};

export function computeDistanceAspect(rental, car) { 
    return rental.distance * car.price_per_km
}