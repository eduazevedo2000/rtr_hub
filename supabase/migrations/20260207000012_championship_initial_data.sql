-- Insert initial GT3 PRO Class standings data
INSERT INTO public.championship_standings (class, rank, car_number, country_code, team_name, points, behind, starts, poles, wins, top5, top10) VALUES
('GT3 PRO', 1, '68', 'US', 'TwoLemmaTree Racing', 480, 0, 1, 0, 0, 1, 1),
('GT3 PRO', 2, '71', 'US', 'Sim City Racing', 475, -5, 1, 0, 0, 1, 1),
('GT3 PRO', 3, '57', 'US', 'Double Stint Racing', 445, -35, 1, 0, 1, 1, 1),
('GT3 PRO', 4, '157', 'US', 'iRacing Today Motorsports', 410, -70, 1, 0, 0, 1, 1),
('GT3 PRO', 5, '183', 'GB', 'Blocco Motore Simsport', 400, -80, 1, 0, 0, 0, 1),
('GT3 PRO', 6, '84', 'DE', 'Unitronic Fischer Motorsport', 385, -95, 1, 0, 0, 1, 1),
('GT3 PRO', 7, '44', 'DE', 'MATCO Fischer Motorsport', 360, -120, 1, 0, 0, 0, 1),
('GT3 PRO', 8, '73', 'PT', 'PULSAR eSports Team', 340, -140, 1, 1, 0, 0, 1),
('GT3 PRO', 8, '112', 'FI', 'Rusty Spatulas Racing', 340, -140, 1, 0, 0, 0, 1),
('GT3 PRO', 9, '88', 'PT', 'Ric Team Racing', 330, -150, 1, 0, 0, 0, 1),
('GT3 PRO', 10, '18', 'US', 'Gowin Racing', 295, -185, 1, 0, 0, 0, 0),
('GT3 PRO', 11, '65', 'US', 'Vulture Motorsports', 285, -195, 1, 0, 0, 0, 0),
('GT3 PRO', 12, '24', 'PT', 'Grow Racing Team', 280, -200, 1, 0, 0, 0, 0),
('GT3 PRO', 13, '151', 'ES', 'World Of SimRacing Team', 275, -205, 1, 0, 0, 0, 0),
('GT3 PRO', 14, '13', 'ES', 'VSR Competición', 240, -240, 1, 0, 0, 0, 0),
('GT3 PRO', 15, '77', 'PT', 'Virtual Power Sim Racing', 0, -480, 1, 0, 0, 0, 0);

-- Insert initial LMP2 Class standings data
INSERT INTO public.championship_standings (class, rank, car_number, country_code, team_name, points, behind, starts, poles, wins, top5, top10) VALUES
('LMP2', 1, '23', 'DE', 'Twin Turn SR by Debeka Bornheim', 525, 0, 1, 1, 1, 1, 1),
('LMP2', 2, '420', 'US', 'Track Limits SimRacing', 470, -55, 1, 0, 0, 1, 1),
('LMP2', 3, '512', 'DE', 'Wolf Motorsport Simracing', 420, -105, 1, 0, 0, 1, 1),
('LMP2', 4, '11', 'US', 'Vision 1 Motorsports', 410, -115, 1, 0, 0, 1, 1),
('LMP2', 5, '87', 'PT', 'Ric Team Racing', 400, -125, 1, 0, 0, 0, 1),
('LMP2', 6, '14', 'PT', 'Grow Racing Team', 370, -155, 1, 0, 0, 1, 1),
('LMP2', 7, '30', 'GB', 'Fury Simsport', 365, -160, 1, 0, 0, 1, 1),
('LMP2', 8, '22', 'DE', 'Twin Turn SR by Debeka Bornheim', 365, -160, 1, 0, 0, 0, 1),
('LMP2', 9, '757', 'US', 'Flight Level Racing', 345, -180, 1, 0, 0, 0, 1),
('LMP2', 10, '99', 'PT', 'Monarch Racing Team', 320, -205, 1, 0, 0, 0, 1);
