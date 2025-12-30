// Categories, Countries, and Cities data for autocomplete

const CATEGORIES = [
    // Construction & Trades
    { value: 'plumber', label: '🔧 Plumber', es: 'Plomero' },
    { value: 'electrician', label: '⚡ Electrician', es: 'Electricista' },
    { value: 'contractor', label: '🏗️ Contractor', es: 'Contratista' },
    { value: 'carpenter', label: '🪚 Carpenter', es: 'Carpintero' },
    { value: 'painter', label: '🎨 Painter', es: 'Pintor' },
    { value: 'roofer', label: '🏠 Roofer', es: 'Techador' },
    { value: 'hvac', label: '❄️ HVAC', es: 'Aire Acondicionado' },
    { value: 'landscaper', label: '🌳 Landscaper', es: 'Jardinero' },
    { value: 'handyman', label: '🔨 Handyman', es: 'Manitas' },
    { value: 'locksmith', label: '🔐 Locksmith', es: 'Cerrajero' },

    // Health & Beauty
    { value: 'dentist', label: '🦷 Dentist', es: 'Dentista' },
    { value: 'doctor', label: '👨‍⚕️ Doctor', es: 'Médico' },
    { value: 'chiropractor', label: '🦴 Chiropractor', es: 'Quiropráctico' },
    { value: 'physical therapist', label: '💪 Physical Therapist', es: 'Fisioterapeuta' },
    { value: 'veterinarian', label: '🐕 Veterinarian', es: 'Veterinario' },
    { value: 'hairdresser', label: '💇 Hairdresser', es: 'Peluquero' },
    { value: 'barber', label: '💈 Barber', es: 'Barbero' },
    { value: 'nail salon', label: '💅 Nail Salon', es: 'Salón de Uñas' },
    { value: 'spa', label: '🧖 Spa', es: 'Spa' },
    { value: 'massage therapist', label: '💆 Massage Therapist', es: 'Masajista' },

    // Food & Hospitality
    { value: 'restaurant', label: '🍽️ Restaurant', es: 'Restaurante' },
    { value: 'cafe', label: '☕ Cafe', es: 'Cafetería' },
    { value: 'bakery', label: '🥖 Bakery', es: 'Panadería' },
    { value: 'bar', label: '🍺 Bar', es: 'Bar' },
    { value: 'pizza', label: '🍕 Pizza', es: 'Pizzería' },
    { value: 'fast food', label: '🍔 Fast Food', es: 'Comida Rápida' },
    { value: 'catering', label: '🍱 Catering', es: 'Catering' },
    { value: 'food truck', label: '🚚 Food Truck', es: 'Food Truck' },

    // Professional Services
    { value: 'lawyer', label: '⚖️ Lawyer', es: 'Abogado' },
    { value: 'accountant', label: '📊 Accountant', es: 'Contador' },
    { value: 'real estate agent', label: '🏠 Real Estate Agent', es: 'Agente Inmobiliario' },
    { value: 'insurance agent', label: '📋 Insurance Agent', es: 'Agente de Seguros' },
    { value: 'financial advisor', label: '💰 Financial Advisor', es: 'Asesor Financiero' },
    { value: 'marketing agency', label: '📈 Marketing Agency', es: 'Agencia de Marketing' },
    { value: 'web designer', label: '💻 Web Designer', es: 'Diseñador Web' },
    { value: 'photographer', label: '📷 Photographer', es: 'Fotógrafo' },

    // Automotive
    { value: 'auto repair', label: '🔧 Auto Repair', es: 'Taller Mecánico' },
    { value: 'car dealer', label: '🚗 Car Dealer', es: 'Concesionario' },
    { value: 'car wash', label: '🚿 Car Wash', es: 'Lavadero de Autos' },
    { value: 'towing service', label: '🚛 Towing Service', es: 'Grúa' },
    { value: 'tire shop', label: '🛞 Tire Shop', es: 'Gomería' },

    // Retail & Shopping
    { value: 'clothing store', label: '👕 Clothing Store', es: 'Tienda de Ropa' },
    { value: 'jewelry store', label: '💎 Jewelry Store', es: 'Joyería' },
    { value: 'furniture store', label: '🛋️ Furniture Store', es: 'Mueblería' },
    { value: 'electronics store', label: '📱 Electronics Store', es: 'Electrónica' },
    { value: 'pet store', label: '🐾 Pet Store', es: 'Tienda de Mascotas' },
    { value: 'florist', label: '💐 Florist', es: 'Florería' },
    { value: 'grocery store', label: '🛒 Grocery Store', es: 'Supermercado' },

    // Fitness & Recreation
    { value: 'gym', label: '💪 Gym', es: 'Gimnasio' },
    { value: 'yoga studio', label: '🧘 Yoga Studio', es: 'Estudio de Yoga' },
    { value: 'dance studio', label: '💃 Dance Studio', es: 'Escuela de Baile' },
    { value: 'martial arts', label: '🥋 Martial Arts', es: 'Artes Marciales' },
    { value: 'swimming pool', label: '🏊 Swimming Pool', es: 'Piscina' },

    // Education
    { value: 'school', label: '🏫 School', es: 'Escuela' },
    { value: 'tutoring', label: '📚 Tutoring', es: 'Clases Particulares' },
    { value: 'driving school', label: '🚗 Driving School', es: 'Autoescuela' },
    { value: 'music school', label: '🎵 Music School', es: 'Escuela de Música' },
    { value: 'language school', label: '🗣️ Language School', es: 'Academia de Idiomas' },

    // Other Services
    { value: 'cleaning service', label: '🧹 Cleaning Service', es: 'Servicio de Limpieza' },
    { value: 'moving company', label: '📦 Moving Company', es: 'Mudanzas' },
    { value: 'pest control', label: '🐜 Pest Control', es: 'Control de Plagas' },
    { value: 'security company', label: '🔒 Security Company', es: 'Seguridad' },
    { value: 'event planner', label: '🎉 Event Planner', es: 'Organizador de Eventos' },
    { value: 'travel agency', label: '✈️ Travel Agency', es: 'Agencia de Viajes' },
    { value: 'hotel', label: '🏨 Hotel', es: 'Hotel' },
    { value: 'daycare', label: '👶 Daycare', es: 'Guardería' }
];

const COUNTRIES = [
    // North America
    { value: 'USA', label: '🇺🇸 United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'Nashville', 'Detroit', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Atlanta', 'Miami', 'Orlando', 'Tampa', 'Cleveland', 'Pittsburgh', 'Cincinnati', 'Kansas City', 'St Louis', 'Minneapolis', 'New Orleans', 'Salt Lake City', 'Oklahoma City', 'Raleigh', 'Virginia Beach', 'Omaha', 'Colorado Springs'] },
    { value: 'Canada', label: '🇨🇦 Canada', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor'] },
    { value: 'Mexico', label: '🇲🇽 Mexico', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Mérida', 'Cancún', 'Querétaro', 'San Luis Potosí', 'Aguascalientes', 'Hermosillo', 'Chihuahua'] },

    // South America
    { value: 'Argentina', label: '🇦🇷 Argentina', cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'San Miguel de Tucumán', 'La Plata', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan', 'Resistencia', 'Neuquén', 'Santiago del Estero', 'Corrientes', 'Posadas'] },
    { value: 'Brazil', label: '🇧🇷 Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís'] },
    { value: 'Colombia', label: '🇨🇴 Colombia', cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué'] },
    { value: 'Chile', label: '🇨🇱 Chile', cities: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán'] },
    { value: 'Peru', label: '🇵🇪 Peru', cities: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Cusco', 'Iquitos', 'Huancayo', 'Tacna', 'Pucallpa'] },
    { value: 'Ecuador', label: '🇪🇨 Ecuador', cities: ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Manta', 'Portoviejo', 'Ambato', 'Riobamba', 'Loja'] },
    { value: 'Venezuela', label: '🇻🇪 Venezuela', cities: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Ciudad Guayana', 'Barcelona', 'Maturín', 'Maracay', 'San Cristóbal'] },
    { value: 'Uruguay', label: '🇺🇾 Uruguay', cities: ['Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado', 'Tacuarembó', 'Melo', 'Mercedes'] },
    { value: 'Paraguay', label: '🇵🇾 Paraguay', cities: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Encarnación'] },
    { value: 'Bolivia', label: '🇧🇴 Bolivia', cities: ['Santa Cruz', 'La Paz', 'Cochabamba', 'Sucre', 'Oruro', 'Tarija', 'Potosí', 'Sacaba', 'Quillacollo'] },

    // Europe
    { value: 'Spain', label: '🇪🇸 Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón'] },
    { value: 'United Kingdom', label: '🇬🇧 United Kingdom', cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Bristol', 'Edinburgh', 'Leeds', 'Sheffield', 'Newcastle', 'Nottingham', 'Southampton', 'Belfast', 'Leicester', 'Cardiff'] },
    { value: 'Germany', label: '🇩🇪 Germany', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg'] },
    { value: 'France', label: '🇫🇷 France', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Toulon'] },
    { value: 'Italy', label: '🇮🇹 Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua', 'Trieste'] },
    { value: 'Portugal', label: '🇵🇹 Portugal', cities: ['Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Setúbal', 'Coimbra', 'Funchal', 'Almada', 'Agualva-Cacém'] },
    { value: 'Netherlands', label: '🇳🇱 Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen'] },
    { value: 'Belgium', label: '🇧🇪 Belgium', cities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Mechelen'] },
    { value: 'Switzerland', label: '🇨🇭 Switzerland', cities: ['Zürich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel'] },
    { value: 'Austria', label: '🇦🇹 Austria', cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn'] },
    { value: 'Poland', label: '🇵🇱 Poland', cities: ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Białystok'] },
    { value: 'Sweden', label: '🇸🇪 Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'] },
    { value: 'Norway', label: '🇳🇴 Norway', cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Sandnes', 'Tromsø', 'Sarpsborg'] },
    { value: 'Denmark', label: '🇩🇰 Denmark', cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde'] },
    { value: 'Finland', label: '🇫🇮 Finland', cities: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti', 'Kuopio', 'Pori'] },
    { value: 'Ireland', label: '🇮🇪 Ireland', cities: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords', 'Bray', 'Navan'] },
    { value: 'Greece', label: '🇬🇷 Greece', cities: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Rhodes', 'Ioannina', 'Chania', 'Agrinio'] },

    // Asia & Pacific
    { value: 'Australia', label: '🇦🇺 Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin'] },
    { value: 'New Zealand', label: '🇳🇿 New Zealand', cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Napier-Hastings', 'Dunedin', 'Palmerston North', 'Nelson', 'Rotorua'] },
    { value: 'Japan', label: '🇯🇵 Japan', cities: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai'] },
    { value: 'South Korea', label: '🇰🇷 South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Seongnam'] },
    { value: 'India', label: '🇮🇳 India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Pune', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur'] },
    { value: 'Singapore', label: '🇸🇬 Singapore', cities: ['Singapore'] },
    { value: 'Philippines', label: '🇵🇭 Philippines', cities: ['Manila', 'Quezon City', 'Davao', 'Caloocan', 'Cebu City', 'Zamboanga', 'Taguig', 'Antipolo', 'Pasig', 'Cagayan de Oro'] },
    { value: 'Thailand', label: '🇹🇭 Thailand', cities: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Nonthaburi', 'Udon Thani', 'Chon Buri', 'Nakhon Ratchasima', 'Hat Yai'] },
    { value: 'Indonesia', label: '🇮🇩 Indonesia', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Tangerang', 'Depok', 'Bekasi'] },
    { value: 'Malaysia', label: '🇲🇾 Malaysia', cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Kuching', 'Kota Kinabalu', 'Melaka', 'Alor Setar'] },
    { value: 'Vietnam', label: '🇻🇳 Vietnam', cities: ['Ho Chi Minh City', 'Hanoi', 'Hai Phong', 'Da Nang', 'Can Tho', 'Bien Hoa', 'Nha Trang', 'Hue', 'Buon Ma Thuot'] },

    // Middle East
    { value: 'United Arab Emirates', label: '🇦🇪 UAE', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'] },
    { value: 'Saudi Arabia', label: '🇸🇦 Saudi Arabia', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif', 'Tabuk', 'Buraidah', 'Khamis Mushait'] },
    { value: 'Israel', label: '🇮🇱 Israel', cities: ['Tel Aviv', 'Jerusalem', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Netanya', 'Beersheba', 'Holon', 'Bnei Brak'] },
    { value: 'Turkey', label: '🇹🇷 Turkey', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin'] },

    // Africa
    { value: 'South Africa', label: '🇿🇦 South Africa', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Polokwane', 'Nelspruit', 'Kimberley'] },
    { value: 'Egypt', label: '🇪🇬 Egypt', cities: ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura', 'El Mahalla', 'Tanta'] },
    { value: 'Morocco', label: '🇲🇦 Morocco', cities: ['Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan'] },
    { value: 'Nigeria', label: '🇳🇬 Nigeria', cities: ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos'] },
    { value: 'Kenya', label: '🇰🇪 Kenya', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega'] }
];

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CATEGORIES, COUNTRIES };
}
