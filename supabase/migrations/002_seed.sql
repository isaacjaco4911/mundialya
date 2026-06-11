-- =====================================================================
-- MundialYa — Seed: 48 selecciones reales (sorteo 2026) + los 72
-- partidos de la fase de grupos (11–27 jun 2026) + sitios y demo.
-- Ejecutar DESPUÉS de 001_schema.sql.
--
-- Horas: kickoff en UTC. Bogotá = UTC-5 (ej: 14:00 Bogotá = 19:00Z).
-- Sedes/estadios: mejor asignación disponible — ajustables en /admin.
-- Eliminatorias (32avos en adelante, 28 jun – 19 jul): se crean desde
-- /admin cuando se conozcan los cruces.
-- =====================================================================

-- --- 48 selecciones (banderas: flagcdn.com, código ISO 2 letras) -------
insert into teams (name, code, flag_url, group_label, fifa_rank) values
  -- Grupo A
  ('México','MEX','https://flagcdn.com/w160/mx.png','A',14),
  ('Sudáfrica','RSA','https://flagcdn.com/w160/za.png','A',61),
  ('Corea del Sur','KOR','https://flagcdn.com/w160/kr.png','A',22),
  ('Chequia','CZE','https://flagcdn.com/w160/cz.png','A',31),
  -- Grupo B
  ('Canadá','CAN','https://flagcdn.com/w160/ca.png','B',28),
  ('Suiza','SUI','https://flagcdn.com/w160/ch.png','B',17),
  ('Catar','QAT','https://flagcdn.com/w160/qa.png','B',53),
  ('Bosnia y Herzegovina','BIH','https://flagcdn.com/w160/ba.png','B',70),
  -- Grupo C
  ('Brasil','BRA','https://flagcdn.com/w160/br.png','C',5),
  ('Marruecos','MAR','https://flagcdn.com/w160/ma.png','C',11),
  ('Escocia','SCO','https://flagcdn.com/w160/gb-sct.png','C',38),
  ('Haití','HAI','https://flagcdn.com/w160/ht.png','C',84),
  -- Grupo D
  ('Estados Unidos','USA','https://flagcdn.com/w160/us.png','D',16),
  ('Paraguay','PAR','https://flagcdn.com/w160/py.png','D',39),
  ('Australia','AUS','https://flagcdn.com/w160/au.png','D',26),
  ('Turquía','TUR','https://flagcdn.com/w160/tr.png','D',27),
  -- Grupo E
  ('Alemania','GER','https://flagcdn.com/w160/de.png','E',9),
  ('Ecuador','ECU','https://flagcdn.com/w160/ec.png','E',23),
  ('Costa de Marfil','CIV','https://flagcdn.com/w160/ci.png','E',42),
  ('Curazao','CUW','https://flagcdn.com/w160/cw.png','E',82),
  -- Grupo F
  ('Países Bajos','NED','https://flagcdn.com/w160/nl.png','F',7),
  ('Japón','JPN','https://flagcdn.com/w160/jp.png','F',18),
  ('Túnez','TUN','https://flagcdn.com/w160/tn.png','F',43),
  ('Suecia','SWE','https://flagcdn.com/w160/se.png','F',40),
  -- Grupo G
  ('Bélgica','BEL','https://flagcdn.com/w160/be.png','G',8),
  ('Egipto','EGY','https://flagcdn.com/w160/eg.png','G',34),
  ('Irán','IRN','https://flagcdn.com/w160/ir.png','G',21),
  ('Nueva Zelanda','NZL','https://flagcdn.com/w160/nz.png','G',86),
  -- Grupo H
  ('España','ESP','https://flagcdn.com/w160/es.png','H',1),
  ('Uruguay','URU','https://flagcdn.com/w160/uy.png','H',15),
  ('Arabia Saudita','KSA','https://flagcdn.com/w160/sa.png','H',60),
  ('Cabo Verde','CPV','https://flagcdn.com/w160/cv.png','H',68),
  -- Grupo I
  ('Francia','FRA','https://flagcdn.com/w160/fr.png','I',3),
  ('Senegal','SEN','https://flagcdn.com/w160/sn.png','I',19),
  ('Noruega','NOR','https://flagcdn.com/w160/no.png','I',29),
  ('Irak','IRQ','https://flagcdn.com/w160/iq.png','I',58),
  -- Grupo J
  ('Argentina','ARG','https://flagcdn.com/w160/ar.png','J',2),
  ('Austria','AUT','https://flagcdn.com/w160/at.png','J',24),
  ('Argelia','ALG','https://flagcdn.com/w160/dz.png','J',35),
  ('Jordania','JOR','https://flagcdn.com/w160/jo.png','J',64),
  -- Grupo K (¡el de Colombia!)
  ('Portugal','POR','https://flagcdn.com/w160/pt.png','K',6),
  ('Colombia','COL','https://flagcdn.com/w160/co.png','K',13),
  ('Uzbekistán','UZB','https://flagcdn.com/w160/uz.png','K',57),
  ('RD Congo','COD','https://flagcdn.com/w160/cd.png','K',56),
  -- Grupo L
  ('Inglaterra','ENG','https://flagcdn.com/w160/gb-eng.png','L',4),
  ('Croacia','CRO','https://flagcdn.com/w160/hr.png','L',10),
  ('Ghana','GHA','https://flagcdn.com/w160/gh.png','L',73),
  ('Panamá','PAN','https://flagcdn.com/w160/pa.png','L',30)
on conflict (code) do nothing;

-- --- Los 72 partidos de la fase de grupos -------------------------------
create or replace function _tid(c text) returns uuid language sql as
  $$ select id from teams where code = c $$;

insert into matches (stage, group_label, home_team_id, away_team_id, kickoff, stadium, host_city) values
  -- Grupo A
  ('group','A',_tid('MEX'),_tid('RSA'),'2026-06-11 19:00:00+00','Estadio Azteca (Banorte)','Ciudad de México'),
  ('group','A',_tid('KOR'),_tid('CZE'),'2026-06-12 02:00:00+00','Estadio Akron','Guadalajara'),
  ('group','A',_tid('CZE'),_tid('RSA'),'2026-06-18 16:00:00+00','Estadio Mercedes-Benz','Atlanta'),
  ('group','A',_tid('MEX'),_tid('KOR'),'2026-06-19 01:00:00+00','Estadio Akron','Guadalajara'),
  ('group','A',_tid('CZE'),_tid('MEX'),'2026-06-25 01:00:00+00','Estadio Azteca (Banorte)','Ciudad de México'),
  ('group','A',_tid('RSA'),_tid('KOR'),'2026-06-25 01:00:00+00','Estadio BBVA','Monterrey'),
  -- Grupo B
  ('group','B',_tid('CAN'),_tid('BIH'),'2026-06-12 19:00:00+00','Estadio de Toronto','Toronto'),
  ('group','B',_tid('QAT'),_tid('SUI'),'2026-06-13 19:00:00+00','Estadio Lincoln Financial','Filadelfia'),
  ('group','B',_tid('SUI'),_tid('BIH'),'2026-06-18 19:00:00+00','Estadio Gillette','Boston'),
  ('group','B',_tid('CAN'),_tid('QAT'),'2026-06-18 22:00:00+00','Estadio de Toronto','Toronto'),
  ('group','B',_tid('SUI'),_tid('CAN'),'2026-06-24 19:00:00+00','BC Place','Vancouver'),
  ('group','B',_tid('BIH'),_tid('QAT'),'2026-06-24 19:00:00+00','Estadio Lumen','Seattle'),
  -- Grupo C
  ('group','C',_tid('BRA'),_tid('MAR'),'2026-06-13 22:00:00+00','Estadio MetLife','Nueva York / Nueva Jersey'),
  ('group','C',_tid('HAI'),_tid('SCO'),'2026-06-14 01:00:00+00','Estadio BBVA','Monterrey'),
  ('group','C',_tid('SCO'),_tid('MAR'),'2026-06-19 22:00:00+00','Estadio Gillette','Boston'),
  ('group','C',_tid('BRA'),_tid('HAI'),'2026-06-20 00:30:00+00','Estadio MetLife','Nueva York / Nueva Jersey'),
  ('group','C',_tid('SCO'),_tid('BRA'),'2026-06-24 22:00:00+00','Estadio Hard Rock','Miami'),
  ('group','C',_tid('MAR'),_tid('HAI'),'2026-06-24 22:00:00+00','Estadio Mercedes-Benz','Atlanta'),
  -- Grupo D
  ('group','D',_tid('USA'),_tid('PAR'),'2026-06-13 01:00:00+00','Estadio SoFi','Los Ángeles'),
  ('group','D',_tid('AUS'),_tid('TUR'),'2026-06-14 04:00:00+00','BC Place','Vancouver'),
  ('group','D',_tid('USA'),_tid('AUS'),'2026-06-19 19:00:00+00','Estadio Lumen','Seattle'),
  ('group','D',_tid('TUR'),_tid('PAR'),'2026-06-20 03:00:00+00','Estadio Levi''s','San Francisco'),
  ('group','D',_tid('TUR'),_tid('USA'),'2026-06-26 02:00:00+00','Estadio SoFi','Los Ángeles'),
  ('group','D',_tid('PAR'),_tid('AUS'),'2026-06-26 02:00:00+00','Estadio Levi''s','San Francisco'),
  -- Grupo E
  ('group','E',_tid('GER'),_tid('CUW'),'2026-06-14 17:00:00+00','Estadio NRG','Houston'),
  ('group','E',_tid('CIV'),_tid('ECU'),'2026-06-14 23:00:00+00','Estadio Lincoln Financial','Filadelfia'),
  ('group','E',_tid('GER'),_tid('CIV'),'2026-06-20 20:00:00+00','Estadio de Toronto','Toronto'),
  ('group','E',_tid('ECU'),_tid('CUW'),'2026-06-21 00:00:00+00','Estadio Arrowhead','Kansas City'),
  ('group','E',_tid('CUW'),_tid('CIV'),'2026-06-25 20:00:00+00','Estadio NRG','Houston'),
  ('group','E',_tid('ECU'),_tid('GER'),'2026-06-25 20:00:00+00','Estadio AT&T','Dallas'),
  -- Grupo F
  ('group','F',_tid('NED'),_tid('JPN'),'2026-06-14 20:00:00+00','Estadio AT&T','Dallas'),
  ('group','F',_tid('SWE'),_tid('TUN'),'2026-06-15 02:00:00+00','Estadio BBVA','Monterrey'),
  ('group','F',_tid('NED'),_tid('SWE'),'2026-06-20 17:00:00+00','Estadio NRG','Houston'),
  ('group','F',_tid('TUN'),_tid('JPN'),'2026-06-21 04:00:00+00','Estadio Lumen','Seattle'),
  ('group','F',_tid('JPN'),_tid('SWE'),'2026-06-25 23:00:00+00','Estadio Arrowhead','Kansas City'),
  ('group','F',_tid('TUN'),_tid('NED'),'2026-06-25 23:00:00+00','Estadio AT&T','Dallas'),
  -- Grupo G
  ('group','G',_tid('BEL'),_tid('EGY'),'2026-06-15 19:00:00+00','Estadio Lincoln Financial','Filadelfia'),
  ('group','G',_tid('IRN'),_tid('NZL'),'2026-06-16 01:00:00+00','Estadio Lumen','Seattle'),
  ('group','G',_tid('BEL'),_tid('IRN'),'2026-06-21 19:00:00+00','Estadio Mercedes-Benz','Atlanta'),
  ('group','G',_tid('NZL'),_tid('EGY'),'2026-06-22 01:00:00+00','Estadio SoFi','Los Ángeles'),
  ('group','G',_tid('EGY'),_tid('IRN'),'2026-06-27 03:00:00+00','Estadio Lumen','Seattle'),
  ('group','G',_tid('NZL'),_tid('BEL'),'2026-06-27 03:00:00+00','BC Place','Vancouver'),
  -- Grupo H
  ('group','H',_tid('ESP'),_tid('CPV'),'2026-06-15 16:00:00+00','Estadio Gillette','Boston'),
  ('group','H',_tid('KSA'),_tid('URU'),'2026-06-15 22:00:00+00','Estadio Hard Rock','Miami'),
  ('group','H',_tid('ESP'),_tid('KSA'),'2026-06-21 16:00:00+00','Estadio de Toronto','Toronto'),
  ('group','H',_tid('URU'),_tid('CPV'),'2026-06-21 22:00:00+00','Estadio NRG','Houston'),
  ('group','H',_tid('CPV'),_tid('KSA'),'2026-06-27 00:00:00+00','Estadio BBVA','Monterrey'),
  ('group','H',_tid('URU'),_tid('ESP'),'2026-06-27 00:00:00+00','Estadio Akron','Guadalajara'),
  -- Grupo I
  ('group','I',_tid('FRA'),_tid('SEN'),'2026-06-16 19:00:00+00','Estadio MetLife','Nueva York / Nueva Jersey'),
  ('group','I',_tid('IRQ'),_tid('NOR'),'2026-06-16 22:00:00+00','Estadio Gillette','Boston'),
  ('group','I',_tid('FRA'),_tid('IRQ'),'2026-06-22 21:00:00+00','Estadio Lincoln Financial','Filadelfia'),
  ('group','I',_tid('NOR'),_tid('SEN'),'2026-06-23 00:00:00+00','Estadio de Toronto','Toronto'),
  ('group','I',_tid('NOR'),_tid('FRA'),'2026-06-26 19:00:00+00','Estadio Gillette','Boston'),
  ('group','I',_tid('SEN'),_tid('IRQ'),'2026-06-26 19:00:00+00','Estadio MetLife','Nueva York / Nueva Jersey'),
  -- Grupo J
  ('group','J',_tid('ARG'),_tid('ALG'),'2026-06-17 01:00:00+00','Estadio Arrowhead','Kansas City'),
  ('group','J',_tid('AUT'),_tid('JOR'),'2026-06-17 04:00:00+00','Estadio Levi''s','San Francisco'),
  ('group','J',_tid('ARG'),_tid('AUT'),'2026-06-22 17:00:00+00','Estadio AT&T','Dallas'),
  ('group','J',_tid('JOR'),_tid('ALG'),'2026-06-23 03:00:00+00','Estadio Levi''s','San Francisco'),
  ('group','J',_tid('ALG'),_tid('AUT'),'2026-06-28 02:00:00+00','BC Place','Vancouver'),
  ('group','J',_tid('JOR'),_tid('ARG'),'2026-06-28 02:00:00+00','Estadio SoFi','Los Ángeles'),
  -- Grupo K (¡el de Colombia!)
  ('group','K',_tid('POR'),_tid('COD'),'2026-06-17 17:00:00+00','Estadio NRG','Houston'),
  ('group','K',_tid('UZB'),_tid('COL'),'2026-06-18 02:00:00+00','Estadio Azteca (Banorte)','Ciudad de México'),
  ('group','K',_tid('POR'),_tid('UZB'),'2026-06-23 17:00:00+00','Estadio Mercedes-Benz','Atlanta'),
  ('group','K',_tid('COL'),_tid('COD'),'2026-06-24 02:00:00+00','Estadio Akron','Guadalajara'),
  ('group','K',_tid('COL'),_tid('POR'),'2026-06-27 23:30:00+00','Estadio Hard Rock','Miami'),
  ('group','K',_tid('COD'),_tid('UZB'),'2026-06-27 23:30:00+00','Estadio Mercedes-Benz','Atlanta'),
  -- Grupo L
  ('group','L',_tid('ENG'),_tid('CRO'),'2026-06-17 20:00:00+00','Estadio AT&T','Dallas'),
  ('group','L',_tid('GHA'),_tid('PAN'),'2026-06-17 23:00:00+00','Estadio de Toronto','Toronto'),
  ('group','L',_tid('ENG'),_tid('GHA'),'2026-06-23 20:00:00+00','Estadio Gillette','Boston'),
  ('group','L',_tid('PAN'),_tid('CRO'),'2026-06-23 23:00:00+00','Estadio MetLife','Nueva York / Nueva Jersey'),
  ('group','L',_tid('PAN'),_tid('ENG'),'2026-06-27 21:00:00+00','Estadio MetLife','Nueva York / Nueva Jersey'),
  ('group','L',_tid('CRO'),_tid('GHA'),'2026-06-27 21:00:00+00','Estadio Lincoln Financial','Filadelfia');

drop function _tid(text);

-- --- Liga global pública -----------------------------------------------
insert into leagues (name, code, owner_id, is_public)
values ('Polla Global MundialYa','GLOBAL','system',true)
on conflict (code) do nothing;

-- --- 6 sitios "dónde ver" de ejemplo (Bogotá) ---------------------------
insert into venues (name, address, neighborhood, city, phone, photo_url, description, screens, promos, showing_match_id, is_verified, is_featured, featured_until) values
  ('Café La Tribuna','Cra 7 # 53-40','Chapinero','Bogotá','+57 313 650 0697','https://picsum.photos/seed/mundialya-v1/800/500','Café futbolero con pantalla gigante, brunch y ambiente de estadio.',4,'2x1 en café durante los partidos de Colombia',(select id from matches m join teams h on m.home_team_id=h.id where h.code='UZB' limit 1),true,true,'2026-07-19 23:59:59+00'),
  ('Restaurante El Estadio 93','Cll 93B # 12-18','Parque de la 93','Bogotá','+57 313 650 0697','https://picsum.photos/seed/mundialya-v2/800/500','Parrilla y comida típica con 6 pantallas y terraza. Ideal para grupos.',6,'Picada mundialista para 4 por $79.900',(select id from matches m join teams h on m.home_team_id=h.id where h.code='UZB' limit 1),true,true,'2026-07-19 23:59:59+00'),
  ('Plaza Gastronómica La Marca','Cll 119 # 6A-20','Usaquén','Bogotá','+57 313 650 0697','https://picsum.photos/seed/mundialya-v3/800/500','Plaza de comidas al aire libre con pantalla LED de 5 metros. Family-friendly.',2,'Helado gratis para niños con camiseta de la Selección',(select id from matches m join teams h on m.home_team_id=h.id where h.code='MEX' order by m.kickoff limit 1),true,false,null),
  ('Café Gol Caribe','Cll 140 # 13-25','Cedritos','Bogotá','+57 313 650 0697','https://picsum.photos/seed/mundialya-v4/800/500','Café costeño: arepa e'' huevo, jugos naturales y todos los partidos.',3,'Combo arepa + jugo a $12.000 en partidos de la jornada',null,true,false,null),
  ('Terraza Mundialista','Av. Esperanza # 75-30','Modelia','Bogotá','+57 313 650 0697','https://picsum.photos/seed/mundialya-v5/800/500','Terraza con asados, juegos para niños y pantalla gigante.',2,'Parqueadero gratis por consumo mayor a $50.000',(select id from matches m join teams h on m.home_team_id=h.id where h.code='BRA' order by m.kickoff limit 1),false,false,null),
  ('Family Park El Hincha','Av. 68 # 24-50','Salitre','Bogotá','+57 313 650 0697','https://picsum.photos/seed/mundialya-v6/800/500','Parque familiar con zona de picnic y pantalla inflable para los partidos.',1,'Entrada libre — reserva tu manta mundialista',null,false,false,null);

-- --- Encuesta global, banner, popup y contador inicial ------------------
insert into polls (match_id, question, options)
values (null, '¿Quién será campeón del Mundial 2026?', '["Argentina","Brasil","Francia","España","Colombia","Otro"]'::jsonb);

insert into banners (title, image_url, link, placement, active, priority) values
  ('Tu marca aquí — patrocina MundialYa', null, '/metricas', 'home_top', true, 1),
  ('Espacio disponible para patrocinador', null, '/metricas', 'match', true, 1);

insert into popups (title, body, link, active, frequency_hours) values
  ('⚽ ¡Arranca el Mundial!','Colombia debuta el 17 de junio contra Uzbekistán. Crea tu polla y reta a tu parche antes del pitazo.','/polla',true,12);

insert into site_stats (key, value) values ('site_visits', 0)
on conflict (key) do nothing;
