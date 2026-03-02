-- Seed Brazilian legal areas
INSERT INTO public.legal_areas (name, slug, description, icon) VALUES
  ('Direito Civil', 'civil', 'Contratos, responsabilidade civil, obrigacoes e direitos reais', 'Scale'),
  ('Direito Penal', 'penal', 'Crimes, defesa criminal e procedimentos penais', 'Shield'),
  ('Direito Trabalhista', 'trabalhista', 'Relacoes de trabalho, CLT, rescisoes e processos trabalhistas', 'Briefcase'),
  ('Direito Tributario', 'tributario', 'Impostos, planejamento tributario e defesa fiscal', 'Receipt'),
  ('Direito Empresarial', 'empresarial', 'Abertura de empresas, contratos comerciais e recuperacao judicial', 'Building2'),
  ('Direito de Familia', 'familia', 'Divorcio, guarda de filhos, pensao alimenticia e inventario', 'Heart'),
  ('Direito Previdenciario', 'previdenciario', 'Aposentadoria, beneficios do INSS e revisoes previdenciarias', 'Clock'),
  ('Direito Ambiental', 'ambiental', 'Licenciamento ambiental, crimes ambientais e sustentabilidade', 'TreePine'),
  ('Direito do Consumidor', 'consumidor', 'Defesa do consumidor, recalls, garantias e CDC', 'ShoppingCart'),
  ('Direito Imobiliario', 'imobiliario', 'Compra e venda de imoveis, locacao e usucapiao', 'Home'),
  ('Direito Digital', 'digital', 'Crimes ciberneticos, LGPD, privacidade e contratos digitais', 'Monitor'),
  ('Direito Internacional', 'internacional', 'Comercio exterior, imigracao e tratados internacionais', 'Globe'),
  ('Direito Administrativo', 'administrativo', 'Licitacoes, concursos publicos e mandado de seguranca', 'Landmark'),
  ('Direito Eleitoral', 'eleitoral', 'Campanhas eleitorais, impugnacoes e representacoes', 'Vote'),
  ('Propriedade Intelectual', 'propriedade-intelectual', 'Patentes, marcas, direitos autorais e software', 'Lightbulb')
ON CONFLICT (slug) DO NOTHING;
