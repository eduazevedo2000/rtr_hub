-- Create enum for race event types
CREATE TYPE public.race_event_type AS ENUM (
  'race_start',
  'pit_stop',
  'position_change',
  'fcy_short',
  'fcy_long',
  'incident',
  'driver_change',
  'restart',
  'finish',
  'qualification',
  'other'
);

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  known_as TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create races table
CREATE TABLE public.races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  track TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  position_finished TEXT,
  split TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create race_events table (ocorrências de corrida)
CREATE TABLE public.race_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID REFERENCES public.races(id) ON DELETE CASCADE NOT NULL,
  lap INTEGER NOT NULL,
  description TEXT NOT NULL,
  event_type race_event_type NOT NULL DEFAULT 'other',
  position TEXT,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  clip_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create qualifying_results table
CREATE TABLE public.qualifying_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID REFERENCES public.races(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  lap_time TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_achievements table (Palmarés)
CREATE TABLE public.team_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  image_url TEXT,
  race_id UUID REFERENCES public.races(id) ON DELETE SET NULL,
  position_finished TEXT,
  category TEXT,
  split TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create faq table
CREATE TABLE public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create images table (armazenamento de imagens)
CREATE TABLE public.images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_types table (tipos de ocorrência de corrida)
CREATE TABLE public.event_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create track_info table (weather forecast and track map)
CREATE TABLE public.track_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID REFERENCES public.races(id) ON DELETE CASCADE NOT NULL,
  weather_image_id UUID REFERENCES public.images(id) ON DELETE SET NULL,
  track_map_id UUID REFERENCES public.images(id) ON DELETE SET NULL,
  weather_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifying_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_info ENABLE ROW LEVEL SECURITY;

-- Create public read policies (everyone can view)
CREATE POLICY "Anyone can view drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Anyone can view races" ON public.races FOR SELECT USING (true);
CREATE POLICY "Anyone can view race events" ON public.race_events FOR SELECT USING (true);
CREATE POLICY "Anyone can view qualifying results" ON public.qualifying_results FOR SELECT USING (true);
CREATE POLICY "Anyone can view achievements" ON public.team_achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can view faq" ON public.faq FOR SELECT USING (true);
CREATE POLICY "Anyone can view images" ON public.images FOR SELECT USING (true);
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view event types" ON public.event_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view track info" ON public.track_info FOR SELECT USING (true);

-- Create insert policies for authenticated users (admin)
CREATE POLICY "Authenticated users can insert drivers" ON public.drivers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert races" ON public.races FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert race events" ON public.race_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert qualifying results" ON public.qualifying_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert achievements" ON public.team_achievements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert faq" ON public.faq FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert images" ON public.images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert event types" ON public.event_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert track info" ON public.track_info FOR INSERT TO authenticated WITH CHECK (true);

-- Create update policies for authenticated users
CREATE POLICY "Authenticated users can update drivers" ON public.drivers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update races" ON public.races FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update race events" ON public.race_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update qualifying results" ON public.qualifying_results FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update achievements" ON public.team_achievements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update faq" ON public.faq FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update images" ON public.images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update event types" ON public.event_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update track info" ON public.track_info FOR UPDATE TO authenticated USING (true);

-- Create delete policies for authenticated users
CREATE POLICY "Authenticated users can delete drivers" ON public.drivers FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete races" ON public.races FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete race events" ON public.race_events FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete qualifying results" ON public.qualifying_results FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete achievements" ON public.team_achievements FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete faq" ON public.faq FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete images" ON public.images FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete event types" ON public.event_types FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete track info" ON public.track_info FOR DELETE TO authenticated USING (true);

-- Enable realtime for race_events table
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_events;

-- Insert categories
INSERT INTO public.categories (name) VALUES
('GERAL'),
('LMP2'),
('GT3 PRO');

-- Insert event_types (value must match race_event_type enum)
INSERT INTO public.event_types (value, label, order_index) VALUES
('race_start', '🏁 Partida', 1),
('pit_stop', '⛽ Pit Stop', 2),
('position_change', '📊 Mudança de Posição', 3),
('fcy_short', '🟡 Short FCY', 4),
('fcy_long', '🟡 Long FCY', 5),
('incident', '⚠️ Incidente', 6),
('driver_change', '👥 Troca de Piloto', 7),
('restart', '🟢 Restart', 8),
('finish', '🏆 Fim de Corrida', 9),
('qualification', '⏱️ Qualificação', 10),
('other', '📝 Outro', 11);

-- Insert drivers (name, alcunha; category não definida por agora)
INSERT INTO public.drivers (name, known_as) VALUES
('Francisco Silva', 'Kiko'),
('Bruno Monteiro', 'Presidente'),
('José Barbosa', 'Pirate'),
('Duarte Mota', 'Mota'),
('Roberto Artur', 'Roberto'),
('Marco Vilela', 'Marco'),
('Afonso Reis', 'Afonso'),
('Bernardo Silva', 'Bernardo'),
('Rodrigo Marreiros', 'Rodrigo');

-- Insert races
INSERT INTO public.races (name, track, date, is_active, position_finished, split) VALUES
-- 2024
('6 horas de SPA - Francorchamps', 'Spa-Francorchamps', '2024-01-01'::timestamp with time zone, false, '8', NULL),
('10 horas de Petit Le Mans', 'Road Atlanta', '2024-01-01'::timestamp with time zone, false, '1', '9'),
('6 horas de Interlagos', 'Autódromo de Interlagos', '2024-01-01'::timestamp with time zone, false, '4', NULL),
-- 2025
('24 horas de Daytona', 'Daytona International Speedway', '2025-01-01'::timestamp with time zone, false, '9', NULL),
('12 horas de Bathurst', 'Mount Panorama Circuit', '2025-01-01'::timestamp with time zone, false, '13', '8'),
('12 horas de Sebring', 'Sebring International Raceway', '2025-01-01'::timestamp with time zone, false, '17', '7'),
('12 horas de SPA', 'Spa-Francorchamps', '2025-01-01'::timestamp with time zone, false, '2', '1/8'),
('24 horas de Nurburgring', 'Nürburgring Nordschleife', '2025-01-01'::timestamp with time zone, false, '7', '3/11'),
('24 horas de Le Mans', 'Circuit de la Sarthe', '2025-01-01'::timestamp with time zone, false, '12', '5'),
('24 horas de SPA', 'Spa-Francorchamps', '2025-01-01'::timestamp with time zone, false, 'DNF', '2'),
('6 horas de Indy', 'Indianapolis Motor Speedway', '2025-01-01'::timestamp with time zone, false, '20', '4'),
('10 horas de Petit Le Mans', 'Road Atlanta', '2025-01-01'::timestamp with time zone, false, '4', '1/11'),
('24 horas de Barcelona', 'Circuit de Barcelona-Catalunya', '2025-01-01'::timestamp with time zone, false, '13', '2'),
('24 horas de Spa-Francorchamps', 'Spa-Francorchamps', '2025-01-01'::timestamp with time zone, false, '11', '1'),
-- 2026
('24h Daytona VSCA Championship 2026', 'Daytona International Speedway', '2026-01-10'::timestamp with time zone, false, '8', NULL);

-- Insert team achievements (Palmarés)
INSERT INTO public.team_achievements (title, description, date, image_url, race_id, position_finished, category, split) VALUES
-- 2024
('6 horas de SPA - Francorchamps', '8 lugar com Ferrari 296 GT3', '2024', NULL, (SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' AND track = 'Spa-Francorchamps' LIMIT 1), '8', 'GT3 PRO', NULL),
('10 horas de Petit Le Mans', '1 lugar com Ferrari 296 GT3', '2024', NULL, (SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), '1', 'GT3 PRO', '9'),
('6 horas de Interlagos', '4 lugar com Ferrari 296 GT3', '2024', NULL, (SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), '4', 'GT3 PRO', NULL),
-- 2025
('24 horas de Daytona', '9 lugar com Ferrari 296 GT3', '2025', NULL, (SELECT id FROM public.races WHERE name = '24 horas de Daytona' LIMIT 1), '9', 'GT3 PRO', NULL),
('12 horas de Bathurst', '13 lugar com Acura NSX GT3 EVO 22', '2025', NULL, (SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), '13', 'GT3 PRO', '8'),
('12 horas de Sebring', '17 lugar com Mercedes AMG GT3 2020', '2025', NULL, (SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), '17', 'GT3 PRO', '7'),
('12 horas de SPA', '2 lugar em ambos splits com o BMW M4 GT3', '2025', NULL, (SELECT id FROM public.races WHERE name = '12 horas de SPA' LIMIT 1), '2', 'GT3 PRO', '1/8'),
('24 horas de Nurburgring', 'Equipa 1 - P7 // Equipa 2 - P13', '2025', NULL, (SELECT id FROM public.races WHERE name = '24 horas de Nurburgring' LIMIT 1), '7', 'GT3 PRO', '3/11'),
('24 horas de Le Mans', '12 lugar com o Mercedes AMG GT3 2020', '2025', NULL, (SELECT id FROM public.races WHERE name = '24 horas de Le Mans' LIMIT 1), '12', 'GT3 PRO', '5'),
('24 horas de SPA', 'DNF com o BMW M4 GT3', '2025', NULL, (SELECT id FROM public.races WHERE name = '24 horas de SPA' LIMIT 1), 'DNF', 'GT3 PRO', '2'),
('6 horas de Indy', 'P20 com o Audi R8 GT3', '2025', NULL, (SELECT id FROM public.races WHERE name = '6 horas de Indy' LIMIT 1), '20', 'GT3 PRO', '4'),
('10 horas de Petit Le Mans', 'Equipa 1 - P6 // Equipa 2 - P11 // Equipa 3 - P4', '2025', NULL, (SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2025%' LIMIT 1), '4', 'GT3 PRO', '1/11'),
('24 horas de Barcelona', 'Equipa 1 - P13', '2025', NULL, (SELECT id FROM public.races WHERE name = '24 horas de Barcelona' LIMIT 1), '13', 'GT3 PRO', '2'),
('24 horas de Spa-Francorchamps', 'Equipa 1 - P11', '2025', NULL, (SELECT id FROM public.races WHERE name = '24 horas de Spa-Francorchamps' LIMIT 1), '11', 'GT3 PRO', '1'),
-- 2026
('24h Daytona VSCA Championship 2026', 'GT3 PRO - P8 // LMP2 - DQ (VSCA)', '2026', NULL, (SELECT id FROM public.races WHERE name = 'Roar Before The 24' LIMIT 1), '8', 'GT3 PRO', NULL);

-- Insert FAQ entries
INSERT INTO public.faq (question, answer, order_index) VALUES
('O Ric vai correr?', 'Nao o Ric nao ira correr, mas estara a acompanhar a equipa durante a prova.', 1),
('Que prova estão a fazer e qual é a pista?', 'Vamos correr nas 24 horas de Daytona', 2),
('Quais são as classes em prova?', 'GTP/LMP2/GT3 PRO/GT3 AM', 3),
('Qual é o vosso carro e classe?', 'Vamos estar ao volante do BMW M4 GT3', 4),
('Qual é a liçenca necessária para participar na corrida?', 'E um campeonato privado, não requer uma liçenca necessaria', 5),
('Qual é o volante que utilizam?', 'KIKO - Base e Volante Moza R12, Pedais SIMSON PRO X | PIRATE - Base e pedais G29 | SWOSH - Base Csl DD 8, Pedais csl V3 e Volante BMW v2 | BRUNO - Base Csl DD 8, Pedais Fanatec V3 e Volante Sim Magic GT NEO | Cockpit Simlab GT1 Pro | BERNARDO - Volante Gt neo, Base simagic alpha, Pedais conspit cpp evo | ROBERTO - Base Simucube 2 pro, Pedais heusinkveld ultimate+ e simucube active pedal ultimate, Volante GT-Neo | AFONSO - Base csl dd 5nm, Fanatec CSL Hub com o volante R300, Pedais heusinkveld sprint | MARCO - Base T300, Pedais DC2 | MOTA - Base Fanatec CSL DD 5NM, Pedais CSL Pedals LC, Volante CSL steering wheel P1 V2 | RODRIGO - Base simagic alpha ultimate, Volante simagic gt1 sd, Pedais moza sr-p', 6),
('Quantos particiapntes podem estar em cada equipa? E quantos carros são no total?', 'Cada equipa tem que ter no minimo 3 pilotos e no maximo pode ser composta por 16 pilotos.', 7),
('Há premiação para os primeiros colocado? Qual é o prémio?', 'Não há prémio para o vencedor. Contudo, como gostamos de tratar bem os nosso pilotos, estes recebem uma sandes de presunto e um sumol de laranja. No final do campeonato VSCA o vencedor ganha um trofeu.', 8),
('Qual é a previsão de tempo?', 'Na página "Previsão de Tempo" encontras os gráficos com as previsões de tempo e chuva.', 9),
('Os carros de cada classe são todos iguais?', 'Não, o simulador tem o sistema BOP (Balance of Performance) em que basicamente os organizadores conseguem restritar certos carros, em potência ou no máximo de combustivel que podem levar.', 10),
('A cada STINT trocam de pneus ou só enchem o tanque de combustível?', 'Trocamos os 4 pneus e enchemos o tanque de combustível em todos os stints.', 11),
('A que horas inicia a corrida e qual é a hora no servidor?', 'Os pilotos vão entrar para o servidor às 14:00 horas de Portugal e a prova tem a duração de 24 horas. A corrida comeca as 15:00', 12),
('Quem são os pilotos?', 'GT3 PRO - @josebarbosa2002, @marovi87, @rmarreiros01 | LMP2 - @313afonso, @kiko_silvaa, @robertoartur86simracing', 13),
('Acompanha aqui o live timing', 'Timing: https://www.vscaracing.com/live/timing_broadcast.html | Timing (optimized for tablets and smart phones): https://www.vscaracing.com/live/timing3.html', 14);

-- Insert race events for 24 horas de Daytona
-- LMP2 events
INSERT INTO public.race_events (race_id, lap, description, event_type, position, driver_id, category) VALUES
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 0, 'Era suposto comecar em P10 mas vamos arrancar P9 por causa de um erro de um adversario.', 'race_start', 'P9', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 21, 'Full curse yellow curta no min 21:13 da corrida, subimos para p4 entretanto', 'fcy_short', 'P4', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 45, 'Full curse yellow longo no min 45 da corrida, colocamos fuel e continuamos p4', 'fcy_long', 'P4', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 46, 'Retorno da corrida, 1 volta depois outro full curse yellow curto, seguimos p4', 'restart', 'P4', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 47, 'Mais um full curse yellow curto', 'fcy_short', 'P4', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 86, 'Mais um full curse yellow 1h:26min da corrida, continuamos p4 com afonso no volante', 'fcy_long', 'P4', (SELECT id FROM public.drivers WHERE name = 'Afonso Reis' LIMIT 1), 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 100, 'Clip do Incidente, por sorte nao batemos, perdemos algumas posições, mas continuamos sem danos', 'incident', NULL, NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 77, 'Roberto entra para fazer o stint, mas nao tinha feedback no volante, teve que sair e voltou a entrar afonso, estamos p9', 'driver_change', 'P9', (SELECT id FROM public.drivers WHERE name = 'Afonso Reis' LIMIT 1), 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 78, 'VOLTA 78 - Roberto volta a entrar, P9', 'driver_change', 'P9', (SELECT id FROM public.drivers WHERE name = 'Roberto Artur' LIMIT 1), 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 96, 'VOLTA 96 - Box depois de um full curse yellow longo, ganhamos 1 posição. P8', 'pit_stop', 'P8', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 102, 'VOLTA 102 - Arranque de corrida que deu noutro FCY curto, P8', 'fcy_short', 'P8', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 146, 'VOLTA 146 - Long FCY - P4', 'fcy_long', 'P4', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 150, 'Clip do Safe', 'other', NULL, NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 197, 'VOLTA 197 - Segundo stint do Afonso, p4 após paragem', 'pit_stop', 'P4', (SELECT id FROM public.drivers WHERE name = 'Afonso Reis' LIMIT 1), 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 208, 'VOLTA 208 - Fim de FCY, Entra Roberto P4', 'driver_change', 'P4', (SELECT id FROM public.drivers WHERE name = 'Roberto Artur' LIMIT 1), 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 224, 'VOLTA 224 - FCY curta, mantemos p4', 'fcy_short', 'P4', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 255, 'VOLTA 255 - Fizemos DT devido a um incidente reportado no inicio da corrida. P5', 'other', 'P5', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 270, 'VOLTA 270 - Long FCY - P6', 'fcy_long', 'P6', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 315, 'VOLTA 315 - Long FCY - P5', 'fcy_long', 'P5', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 327, 'VOLTA 327 - Fim do Long FCY - P1', 'restart', 'P1', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 351, 'VOLTA 351 - Long FCY - p6', 'fcy_long', 'P6', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 506, 'VOLTA 506 - Short FCY P4', 'fcy_short', 'P4', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 510, 'VOLTA 510 - Acidente na bus stop, 18m repairs-p9 (clip)', 'incident', 'P9', NULL, 'LMP2'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 550, 'VOLTA 550 - Long FCY-p9', 'fcy_long', 'P9', NULL, 'LMP2');

-- GT3 PRO events
INSERT INTO public.race_events (race_id, lap, description, event_type, position, driver_id, category) VALUES
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 0, 'Race Start - Rodrigo Marreiros', 'race_start', NULL, (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 4, 'Lap 4 - Ultrapassagem na T1 para P6', 'position_change', 'P6', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 8, 'Lap 8 - Short FCY - P6', 'fcy_short', 'P6', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 17, 'Lap 17 - FCY - P6', 'fcy_long', 'P6', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 20, 'Lap 20 - Pit open - Paramos para combustivel.', 'pit_stop', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 25, 'Lap 25 - Restart da corrida.', 'restart', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 25, 'Lap 25 - Bom arranque, mas toque na T4. Rodamos e Caimos para P15 - Clip do Incidente', 'incident', 'P15', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 26, 'Lap 26 - Short FCY - P15', 'fcy_short', 'P15', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 30, 'Lap 30 - Restart da corrida - P15', 'restart', 'P15', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 31, 'Lap 31 - Long FCY - P15', 'fcy_long', 'P15', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 39, 'Lap 39 - Restart da corrida em P15', 'restart', 'P15', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 39, 'Lap 39 - Bom arranque - P12', 'position_change', 'P12', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 41, 'Lap 41 - P11', 'position_change', 'P11', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 65, 'Lap 65 - PitStop - Pirate ao Volante - P11', 'pit_stop', 'P11', (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 65, 'Lap 65 - Faltam 21:30H para o final', 'other', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 86, 'Lap 86 - Long FCY - P10', 'fcy_long', 'P10', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 92, 'Lap 92 - Paragem no Pitstop - Full Service - P9', 'pit_stop', 'P9', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 98, 'Lap 98 - Restart da corrida', 'restart', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 99, 'Lap 99 - Short FCY - P8', 'fcy_short', 'P8', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 102, 'Lap 102 - Restart da Corrida', 'restart', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 125, 'Lap 125 - Sai Pirate entra Marco', 'driver_change', NULL, (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 144, 'Lap 144 - Long FCY - P9', 'fcy_long', 'P9', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 165, 'Lap 165 - Carro 77 dá-nos um toque 2x', 'incident', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 185, 'Lap 185 - Entrada no Pitbox', 'pit_stop', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 185, 'Lap 185 - Entra o Rodrigo Marreiros - P14', 'driver_change', 'P14', (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 201, 'Lap 201 - FCY', 'fcy_long', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 207, 'Lap 207 - Pit para por combustivel.', 'pit_stop', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 216, 'Lap 216 - Short FCY P11', 'fcy_short', 'P11', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 231, 'Lap 231 - P13 dps de um pequeno spin mas 0 damage', 'incident', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 247, 'Lap 247 - Green flag P10', 'restart', 'P10', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 334, 'Lap 334 - Paragem para abastecer. Estamos P5', 'pit_stop', 'P5', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 340, 'Incidente - Clip', 'incident', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 438, 'Lap 438 - Pitstop em FCY', 'pit_stop', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 438, 'Lap 438 - Rodrigo entra no carro', 'driver_change', NULL, (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 448, 'Lap 448 - Restart - P13', 'restart', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 450, 'Erro na FCY, deixou-nos uma volta atras do lider, erro do Race Control', 'other', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 470, 'Lap 470 - Pitstop - P13', 'pit_stop', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 475, 'Lap 475 - FCY', 'fcy_long', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 491, 'Lap 491 - Restart - P13', 'restart', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 497, 'Lap 497 - Long FCY', 'fcy_long', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 546, 'Lap 546 - Pitstop - Pirate entra no carro - P12', 'driver_change', 'P12', (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 551, 'Lap 551 - Restart', 'restart', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 609, 'Lap 609 - Pitbox - Entra Rodrigo - Paramos em P1', 'pit_stop', 'P1', (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 609, 'Lap 609 - despiste na Bus Stop com pneu frio - Carro com dano na direçao', 'incident', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 610, 'Incidente - Clip', 'incident', NULL, NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 619, 'Lap 619 - Long FCY - P9', 'fcy_long', 'P9', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 623, 'Lap 623 - Pitstop - Reparamos o carro - P10', 'pit_stop', 'P10', NULL, 'GT3 PRO');

-- Insert race events for 6 horas de SPA - Francorchamps (GT3 PRO)
INSERT INTO public.race_events (race_id, lap, description, event_type, position, driver_id, category) VALUES
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 0, 'Race Start - José Barbosa', 'race_start', 'P12', (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 8, 'Lap 8 - Ultrapassagem na Eau Rouge - P10', 'position_change', 'P10', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 15, 'Lap 15 - Short FCY - P9', 'fcy_short', 'P9', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 25, 'Lap 25 - Pitstop - Full Service - P8', 'pit_stop', 'P8', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 25, 'Lap 25 - Entra Rodrigo Marreiros', 'driver_change', 'P8', (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 42, 'Lap 42 - Long FCY - P8', 'fcy_long', 'P8', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 48, 'Lap 48 - Restart da corrida - P7', 'restart', 'P7', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 55, 'Lap 55 - P6 após bom arranque', 'position_change', 'P6', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 68, 'Lap 68 - Pitstop - Entra Marco Vilela - P8', 'driver_change', 'P8', (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 85, 'Lap 85 - Short FCY - P8', 'fcy_short', 'P8', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 92, 'Lap 92 - Ultrapassagem na Blanchimont - P7', 'position_change', 'P7', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 105, 'Lap 105 - Pitstop final - P7', 'pit_stop', 'P7', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 105, 'Lap 105 - Entra José Barbosa para finalizar', 'driver_change', 'P7', (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 118, 'Lap 118 - Long FCY - P8', 'fcy_long', 'P8', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 125, 'Lap 125 - Restart - P8', 'restart', 'P8', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 130, 'Lap 130 - Mantemos P8 até ao final', 'other', 'P8', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 135, 'Lap 135 - Finish - P8', 'finish', 'P8', NULL, 'GT3 PRO');

-- Insert race events for 10 horas de Petit Le Mans (2024 - GT3 PRO)
INSERT INTO public.race_events (race_id, lap, description, event_type, position, driver_id, category) VALUES
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 0, 'Race Start - Marco Vilela', 'race_start', 'P8', (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 12, 'Lap 12 - P6 após arranque forte', 'position_change', 'P6', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 28, 'Lap 28 - Pitstop - Full Service - P5', 'pit_stop', 'P5', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 28, 'Lap 28 - Entra Rodrigo Marreiros', 'driver_change', 'P5', (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 45, 'Lap 45 - Long FCY - P4', 'fcy_long', 'P4', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 52, 'Lap 52 - Restart - P3', 'restart', 'P3', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 58, 'Lap 58 - Ultrapassagem para P2', 'position_change', 'P2', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 75, 'Lap 75 - Short FCY - P2', 'fcy_short', 'P2', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 88, 'Lap 88 - Pitstop - Entra José Barbosa - P2', 'driver_change', 'P2', (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 105, 'Lap 105 - Lider cai para P3, subimos para P1', 'position_change', 'P1', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 125, 'Lap 125 - Long FCY - P1', 'fcy_long', 'P1', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 132, 'Lap 132 - Restart - Mantemos liderança', 'restart', 'P1', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 148, 'Lap 148 - Pitstop final - P1', 'pit_stop', 'P1', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 148, 'Lap 148 - Entra Marco Vilela para finalizar', 'driver_change', 'P1', (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 165, 'Lap 165 - Mantemos P1 com vantagem confortável', 'other', 'P1', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 180, 'Lap 180 - Short FCY - P1', 'fcy_short', 'P1', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 195, 'Lap 195 - Finish - VITÓRIA!', 'finish', 'P1', NULL, 'GT3 PRO');

-- Insert race events for 6 horas de Interlagos (GT3 PRO)
INSERT INTO public.race_events (race_id, lap, description, event_type, position, driver_id, category) VALUES
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 0, 'Race Start - Rodrigo Marreiros', 'race_start', 'P6', (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 5, 'Lap 5 - P5 após primeira volta', 'position_change', 'P5', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 18, 'Lap 18 - Short FCY - P5', 'fcy_short', 'P5', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 32, 'Lap 32 - Pitstop - Full Service - P4', 'pit_stop', 'P4', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 32, 'Lap 32 - Entra José Barbosa', 'driver_change', 'P4', (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 48, 'Lap 48 - Long FCY - P4', 'fcy_long', 'P4', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 55, 'Lap 55 - Restart - P3', 'restart', 'P3', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 62, 'Lap 62 - Mantemos P4 após restart', 'other', 'P4', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 78, 'Lap 78 - Pitstop - Entra Marco Vilela - P4', 'driver_change', 'P4', (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 92, 'Lap 92 - Short FCY - P4', 'fcy_short', 'P4', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 105, 'Lap 105 - Mantemos P4 até ao final', 'other', 'P4', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 118, 'Lap 118 - Finish - P4', 'finish', 'P4', NULL, 'GT3 PRO');

-- Insert race events for 12 horas de Bathurst (GT3 PRO)
INSERT INTO public.race_events (race_id, lap, description, event_type, position, driver_id, category) VALUES
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 0, 'Race Start - Marco Vilela', 'race_start', 'P15', (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 12, 'Lap 12 - P14 após primeiras voltas', 'position_change', 'P14', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 28, 'Lap 28 - Short FCY - P14', 'fcy_short', 'P14', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 42, 'Lap 42 - Pitstop - Full Service - P13', 'pit_stop', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 42, 'Lap 42 - Entra José Barbosa', 'driver_change', 'P13', (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 58, 'Lap 58 - Long FCY - P13', 'fcy_long', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 65, 'Lap 65 - Restart - P13', 'restart', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 78, 'Lap 78 - Mantemos P13', 'other', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 92, 'Lap 92 - Pitstop - Entra Rodrigo Marreiros - P13', 'driver_change', 'P13', (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 108, 'Lap 108 - Short FCY - P13', 'fcy_short', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 125, 'Lap 125 - Long FCY - P13', 'fcy_long', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 132, 'Lap 132 - Restart - P13', 'restart', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 148, 'Lap 148 - Pitstop final - P13', 'pit_stop', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 148, 'Lap 148 - Entra Marco Vilela para finalizar', 'driver_change', 'P13', (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 165, 'Lap 165 - Mantemos P13 até ao final', 'other', 'P13', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 180, 'Lap 180 - Finish - P13', 'finish', 'P13', NULL, 'GT3 PRO');
-- Insert race events for 12 horas de Sebring (GT3 PRO)
INSERT INTO public.race_events (race_id, lap, description, event_type, position, driver_id, category) VALUES
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 0, 'Race Start - Rodrigo Marreiros', 'race_start', 'P18', (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 8, 'Lap 8 - P17 após primeiras voltas', 'position_change', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 22, 'Lap 22 - Short FCY - P17', 'fcy_short', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 38, 'Lap 38 - Pitstop - Full Service - P17', 'pit_stop', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 38, 'Lap 38 - Entra Marco Vilela', 'driver_change', 'P17', (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 52, 'Lap 52 - Long FCY - P17', 'fcy_long', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 58, 'Lap 58 - Restart - P17', 'restart', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 72, 'Lap 72 - Mantemos P17', 'other', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 88, 'Lap 88 - Pitstop - Entra José Barbosa - P17', 'driver_change', 'P17', (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 102, 'Lap 102 - Short FCY - P17', 'fcy_short', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 118, 'Lap 118 - Long FCY - P17', 'fcy_long', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 125, 'Lap 125 - Restart - P17', 'restart', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 138, 'Lap 138 - Pitstop final - P17', 'pit_stop', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 138, 'Lap 138 - Entra Rodrigo Marreiros para finalizar', 'driver_change', 'P17', (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 152, 'Lap 152 - Mantemos P17 até ao final', 'other', 'P17', NULL, 'GT3 PRO'),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 168, 'Lap 168 - Finish - P17', 'finish', 'P17', NULL, 'GT3 PRO');

-- Insert qualifying results (resultados de qualificação)
-- 24 horas de Daytona - LMP2
INSERT INTO public.qualifying_results (race_id, driver_id, lap_time, position) VALUES
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Afonso Reis' LIMIT 1), '1:35.456', 10),

-- 24 horas de Daytona - GT3 PRO
INSERT INTO public.qualifying_results (race_id, driver_id, lap_time, position) VALUES
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), '1:46.234', 16),

-- 6 horas de SPA - Francorchamps - GT3 PRO
INSERT INTO public.qualifying_results (race_id, driver_id, lap_time, position) VALUES
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), '2:18.456', 12),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), '2:18.789', 13),
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), '2:19.123', 14);

-- 10 horas de Petit Le Mans (2024) - GT3 PRO
INSERT INTO public.qualifying_results (race_id, driver_id, lap_time, position) VALUES
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), '1:19.234', 8),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), '1:19.567', 9),
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), '1:19.890', 10);

-- 6 horas de Interlagos - GT3 PRO
INSERT INTO public.qualifying_results (race_id, driver_id, lap_time, position) VALUES
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), '1:33.456', 6),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), '1:33.789', 7),
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), '1:34.123', 8);

-- 12 horas de Bathurst - GT3 PRO
INSERT INTO public.qualifying_results (race_id, driver_id, lap_time, position) VALUES
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), '2:04.567', 15),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), '2:04.890', 16),
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), '2:05.234', 17);

-- 12 horas de Sebring - GT3 PRO
INSERT INTO public.qualifying_results (race_id, driver_id, lap_time, position) VALUES
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Rodrigo Marreiros' LIMIT 1), '1:56.789', 18),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'Marco Vilela' LIMIT 1), '1:57.123', 19),
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), (SELECT id FROM public.drivers WHERE name = 'José Barbosa' LIMIT 1), '1:57.456', 20);

-- Insert images (imagens armazenadas no Supabase Storage)
-- 24h Daytona VSCA Championship 2026 - Weather Forecast
INSERT INTO public.images (storage_path, url, filename, mime_type, description, category) VALUES
('track-weather/24h Daytona VSCA Championship 2026/track-weather.png', 'https://ggkvgohzwwoqdeaqhkzq.supabase.co/storage/v1/object/sign/track-weather/24h%20Daytona%20VSCA%20Championship%202026/track-weather.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hOGY5ZTUxOC0yOWRjLTQ5YzYtYjkzZC0yMDZjODI0OWVhNmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0cmFjay13ZWF0aGVyLzI0aCBEYXl0b25hIFZTQ0EgQ2hhbXBpb25zaGlwIDIwMjYvdHJhY2std2VhdGhlci5wbmciLCJpYXQiOjE3Njg0MzM5MTcsImV4cCI6MTc2OTAzODcxN30.8XV9PX3Cm-dqa5ztvW7bfu4LrjQE6YVsRS4rLIFGHkM', 'track-weather.png', 'image/png', 'Gráfico de previsão de tempo - Clouds e Chance of Precipitation', 'weather_forecast');

-- 24h Daytona VSCA Championship 2026 - Track Map
INSERT INTO public.images (storage_path, url, filename, mime_type, description, category) VALUES
('track-images/24h Daytona VSCA Championship 2026/track-map.png', 'https://ggkvgohzwwoqdeaqhkzq.supabase.co/storage/v1/object/sign/track-images/24h%20Daytona%20VSCA%20Championship%202026/track-map.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hOGY5ZTUxOC0yOWRjLTQ5YzYtYjkzZC0yMDZjODI0OWVhNmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0cmFjay1pbWFnZXMvMjRoIERheXRvbmEgVlNDQSBDaGFtcGlvbnNoaXAgMjAyNi90cmFjay1tYXAucG5nIiwiaWF0IjoxNzY4NDMzOTU3LCJleHAiOjE3NzEwMjU5NTd9.ZI_0CNV3JJJUV0RyQk-zYTEtheGwQSaDxkD5V6PykjM', 'track-map.png', 'image/png', 'Mapa da pista de Daytona International Speedway', 'track_map');

-- Insert track info (informações de pista - weather e track map)
-- 24 horas de Daytona
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '24 horas de Daytona' LIMIT 1), 'Tempo parcialmente nublado, temperatura 22°C. Chuva prevista para as primeiras horas da manhã.', NULL, NULL);

-- 24h Daytona VSCA Championship 2026
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '24h Daytona VSCA Championship 2026' LIMIT 1), 'Previsão de tempo para as 24 horas de Daytona VSCA Championship 2026.', (SELECT id FROM public.images WHERE filename = 'track-weather.png' AND category = 'weather_forecast' LIMIT 1), (SELECT id FROM public.images WHERE filename = 'track-map.png' AND category = 'track_map' LIMIT 1));

-- 6 horas de SPA - Francorchamps
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '6 horas de SPA - Francorchamps' LIMIT 1), 'Condições variáveis típicas de Spa. Temperatura 18°C com possibilidade de chuva.', NULL, NULL);

-- 10 horas de Petit Le Mans (2024)
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2024%' LIMIT 1), 'Dia claro e seco, temperatura 25°C. Condições ideais para corrida.', NULL, NULL);

-- 6 horas de Interlagos
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '6 horas de Interlagos' LIMIT 1), 'Tempo quente e seco, temperatura 28°C. Sol durante toda a prova.', NULL, NULL);

-- 12 horas de Bathurst
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '12 horas de Bathurst' LIMIT 1), 'Condições desafiadoras em Mount Panorama. Neblina matinal e temperatura 15°C.', NULL, NULL);

-- 12 horas de Sebring
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '12 horas de Sebring' LIMIT 1), 'Tempo quente e úmido, temperatura 30°C. Possibilidade de chuva no final da prova.', NULL, NULL);

-- 12 horas de SPA
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '12 horas de SPA' LIMIT 1), 'Condições variáveis. Temperatura 16°C com chuva intermitente.', NULL, NULL);

-- 24 horas de Nurburgring
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '24 horas de Nurburgring' LIMIT 1), 'Condições desafiadoras no Nordschleife. Neblina e temperatura 12°C.', NULL, NULL);

-- 24 horas de Le Mans
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '24 horas de Le Mans' LIMIT 1), 'Tempo variável. Temperatura 20°C com possibilidade de chuva.', NULL, NULL);

-- 24 horas de SPA
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '24 horas de SPA' LIMIT 1), 'Condições típicas de Spa. Chuva prevista durante a noite.', NULL, NULL);

-- 6 horas de Indy
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '6 horas de Indy' LIMIT 1), 'Tempo seco e quente. Temperatura 27°C.', NULL, NULL);

-- 10 horas de Petit Le Mans (2025)
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '10 horas de Petit Le Mans' AND track = 'Road Atlanta' AND date::text LIKE '2025%' LIMIT 1), 'Condições secas. Temperatura 24°C durante toda a prova.', NULL, NULL);

-- 24 horas de Barcelona
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '24 horas de Barcelona' LIMIT 1), 'Tempo seco. Temperatura 22°C.', NULL, NULL);

-- 24 horas de Spa-Francorchamps
INSERT INTO public.track_info (race_id, weather_description, weather_image_id, track_map_id) VALUES
((SELECT id FROM public.races WHERE name = '24 horas de Spa-Francorchamps' LIMIT 1), 'Condições mistas com chuva. Temperatura 14°C.', NULL, NULL);
