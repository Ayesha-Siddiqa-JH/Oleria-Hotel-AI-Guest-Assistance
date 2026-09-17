// Curated high-resolution photography for StayAI Grand Hotel Bengaluru
// Royalty-free luxury hospitality images from Unsplash with reliable fallbacks

export const HOTEL_IMAGES = {
  hero: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85",
  lobby: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  exterior: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
  pool: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
  wifi: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
  valet: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80",
  
  // Dining
  glasshouse_bistro: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
  breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80",
  skyline_lounge: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
  in_room_dining: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",

  // Rooms
  deluxe_room: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
  executive_king_suite: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
  presidential_family_suite: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",

  // Fallback placeholder
  fallback: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
};

export function getRoomImage(roomTypeId) {
  if (roomTypeId === "deluxe_room" || roomTypeId === "deluxe_king") {
    return HOTEL_IMAGES.deluxe_room;
  }
  if (roomTypeId === "executive_king_suite" || roomTypeId === "executive_suite") {
    return HOTEL_IMAGES.executive_king_suite;
  }
  if (roomTypeId === "presidential_family_suite" || roomTypeId === "presidential_family") {
    return HOTEL_IMAGES.presidential_family_suite;
  }
  return HOTEL_IMAGES.deluxe_room;
}
