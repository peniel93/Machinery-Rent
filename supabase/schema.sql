-- ============================================================
-- CONSTRUCTION MACHINERY RENT PORTAL SYSTEM
-- SUPABASE DATABASE SCHEMA & SEED DATA
-- ============================================================

-- 1. PROFILES TABLE (Users & Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL, -- Format: Role/4-digit ID/Year
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'Main Registrar Admin', 'Accountant', 'Finance', 
        'Store Manager', 'Manager', 'Site Worker', 'Reporter'
    )),
    contact VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    gender VARCHAR(20),
    address TEXT,
    default_password VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    is_password_changed BOOLEAN DEFAULT FALSE,
    active_status BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. MACHINERY TABLE
CREATE TABLE IF NOT EXISTS public.machinery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Excavator, Bulldozer, Crane, Loader, Roller, Dump Truck, etc.
    plate_number VARCHAR(100) UNIQUE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    rented_count INT NOT NULL DEFAULT 0,
    available_count INT NOT NULL DEFAULT 1,
    price_per_hour DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    working_hours_rented DECIMAL(10, 2) DEFAULT 0.00,
    operating_sites TEXT DEFAULT '',
    image_url TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Available', -- Available, Rented, Maintenance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. RENTALS TABLE (Rented Machineries List & Approval Requests)
CREATE TABLE IF NOT EXISTS public.rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machinery_id UUID REFERENCES public.machinery(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    site_location VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255),
    requester_phone VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_agreed_hours DECIMAL(10, 2) NOT NULL,
    hourly_rate DECIMAL(12, 2) NOT NULL,
    discount_applied DECIMAL(5, 2) DEFAULT 0.00,
    calculated_revenue DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending Approval', -- Pending Approval, Active, Completed, Declined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. FINANCIAL RECORDS TABLE (Accountant & Finance)
CREATE TABLE IF NOT EXISTS public.financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('revenue', 'expense', 'budget')),
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. STORE INVENTORY TABLE (Store Manager)
CREATE TABLE IF NOT EXISTS public.store_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100) NOT NULL,
    plate_number VARCHAR(100),
    quantity_normal INT NOT NULL DEFAULT 0,
    quantity_defective INT NOT NULL DEFAULT 0,
    total_quantity INT GENERATED ALWAYS AS (quantity_normal + quantity_defective) STORED,
    date_added DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. WORKER SHIFTS TABLE (Manager)
CREATE TABLE IF NOT EXISTS public.worker_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    site_location VARCHAR(255) NOT NULL,
    shift_days TEXT[] NOT NULL, -- Array of days e.g., {'Monday', 'Wednesday'}
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SITE UPDATES TABLE (Site Worker)
CREATE TABLE IF NOT EXISTS public.site_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    machinery_id UUID REFERENCES public.machinery(id) ON DELETE CASCADE,
    hours_logged DECIMAL(10, 2) NOT NULL DEFAULT 0,
    machinery_health VARCHAR(100) NOT NULL, -- Excellent, Good, Fair, Needs Repair
    condition_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. REPORTS TABLE (Inter-dashboard Reports & Registrar Inbox)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_role VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    report_type VARCHAR(50) DEFAULT 'General',
    attachment_url TEXT,
    attachment_format VARCHAR(20), -- csv, pdf, doc
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Reviewed, Approved
    is_seen BOOLEAN DEFAULT FALSE, -- Unseen (New) vs Seen (Old)
    registrar_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure is_seen column exists for existing database instances
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS is_seen BOOLEAN DEFAULT FALSE;

-- 9. PARTNER MACHINERY REQUESTS TABLE (External Partner Organization Rental Agreements & Machinery Listings)
CREATE TABLE IF NOT EXISTS public.partner_machinery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(100) NOT NULL,
    address TEXT,
    machinery_name VARCHAR(255) NOT NULL,
    machinery_type VARCHAR(100) NOT NULL,
    plate_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    proposed_rate DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    agreement_duration VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Declined
    is_seen BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure is_seen column exists for partner machinery requests
ALTER TABLE public.partner_machinery_requests ADD COLUMN IF NOT EXISTS is_seen BOOLEAN DEFAULT FALSE;

-- 10. VACANCIES TABLE (Recruitment)
CREATE TABLE IF NOT EXISTS public.vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title VARCHAR(255) NOT NULL,
    job_type VARCHAR(100) NOT NULL, -- Permanent, Contract, Temporary
    description TEXT NOT NULL,
    place_of_application VARCHAR(255) NOT NULL,
    expiry_date DATE NOT NULL,
    application_is_online BOOLEAN DEFAULT TRUE,
    written_exam_date TIMESTAMP WITH TIME ZONE,
    written_exam_venue VARCHAR(255),
    interview_date TIMESTAMP WITH TIME ZONE,
    interview_venue VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active', -- Active, Expired, Closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. VACANCY APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.vacancy_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    residence_address TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    woreda VARCHAR(100) NOT NULL,
    kebele VARCHAR(100) NOT NULL,
    cv_doc_url TEXT,
    academic_doc_url TEXT,
    university_temp_doc_url TEXT,
    grade12_transcript_url TEXT,
    grade10_transcript_url TEXT,
    grade8_transcript_url TEXT,
    grade12_entrance_url TEXT,
    grade10_matric_url TEXT,
    grade6_ministry_url TEXT,
    grade8_ministry_url TEXT,
    birth_cert_url TEXT,
    fayda_id_url TEXT,
    status VARCHAR(50) DEFAULT 'Submitted', -- Submitted, Exam Scheduled, Interview Scheduled, Passed, Rejected
    written_exam_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Passed, Failed
    written_exam_score DECIMAL(5, 2) DEFAULT 0.00,
    interview_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Passed, Failed
    interview_score DECIMAL(5, 2) DEFAULT 0.00,
    final_result VARCHAR(50) DEFAULT 'Pending', -- Pending, Passed & Selected, Failed
    evaluator_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. PORTAL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.portal_settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_title VARCHAR(255) DEFAULT 'Construction Machinery Rent Portal System',
    logo_url TEXT DEFAULT 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=200&auto=format&fit=crop&q=80',
    hero_bg_url TEXT DEFAULT 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=80',
    copyright_text VARCHAR(255) DEFAULT 'Construction Machinery Rental Organization',
    copyright_year INT DEFAULT 2026,
    about_text TEXT DEFAULT 'Providing reliable heavy machinery rental solutions across Ethiopia for construction, road works, and urban infrastructure development.',
    contact_phone VARCHAR(100) DEFAULT '+251 911 000 111',
    contact_email VARCHAR(255) DEFAULT 'info@machineryrent.org',
    church_organization_address TEXT DEFAULT 'Bole Subcity, Woreda 03, Addis Ababa, Ethiopia',
    google_map_embed_url TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126105.81152062544!2d38.70777174621946!3d8.980603417724128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set',
    telegram_url TEXT DEFAULT 'https://t.me',
    whatsapp_url TEXT DEFAULT 'https://wa.me',
    tiktok_url TEXT DEFAULT 'https://tiktok.com',
    facebook_url TEXT DEFAULT 'https://facebook.com',
    instagram_url TEXT DEFAULT 'https://instagram.com',
    twitter_url TEXT DEFAULT 'https://twitter.com',
    youtube_url TEXT DEFAULT 'https://youtube.com',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. GALLERY MOMENTS TABLE
CREATE TABLE IF NOT EXISTS public.gallery_moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Portal Settings Initial Row
INSERT INTO public.portal_settings (id, site_title, copyright_year)
VALUES (1, 'Construction Machinery Rent Portal System', 2026)
ON CONFLICT (id) DO NOTHING;

-- Initial Main Registrar Admin User (Default Password: Admin123!)
INSERT INTO public.profiles (
    username, full_name, role, contact, email, gender, address, default_password, is_password_changed, active_status
) VALUES (
    'MRA/1001/2026', 'Main Registrar Admin', 'Main Registrar Admin', '+251 900 112 233',
    'registrar@machineryrent.org', 'Male', 'Addis Ababa, Ethiopia', 'Admin123!', TRUE, TRUE
) ON CONFLICT (username) DO NOTHING;

-- Sample Machineries
INSERT INTO public.machinery (name, type, plate_number, quantity, rented_count, available_count, price_per_hour, discount_percent, description, image_url) VALUES
('CAT 320 Heavy Excavator', 'Excavator', 'ET-30241-AA', 5, 2, 3, 120.00, 5.00, '20-ton crawler excavator equipped with hydraulic breaker attachment.', 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?w=800&auto=format&fit=crop&q=80'),
('Komatsu D85 Bulldozer', 'Bulldozer', 'ET-40112-AA', 3, 1, 2, 150.00, 10.00, 'Heavy-duty crawler bulldozer suitable for land clearing and earthworks.', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80'),
('Liebherr 50-Ton Mobile Crane', 'Crane', 'ET-10992-AA', 2, 0, 2, 220.00, 0.00, 'High-capacity telescopic boom mobile crane for heavy structural lifting.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'),
('Volvo L120 Wheel Loader', 'Loader', 'ET-55014-AA', 4, 1, 3, 95.00, 2.50, 'High-efficiency wheel loader with 3.5m³ bucket capacity.', 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800&auto=format&fit=crop&q=80')
ON CONFLICT (plate_number) DO NOTHING;

-- Sample Vacancies
INSERT INTO public.vacancies (job_title, job_type, description, place_of_application, expiry_date, application_is_online) VALUES
('Senior Heavy Equipment Operator', 'Permanent', 'Seeking experienced operators for CAT 320 Excavator and Komatsu Bulldozers. Minimum 5 years experience required.', 'Head Office - Bole Subcity, Addis Ababa', CURRENT_DATE + INTERVAL '30 days', TRUE),
('Site Construction Inspector', 'Contract', 'Responsible for monitoring machinery operations, safety compliance, and logging site working hours.', 'Regional Branch Office', CURRENT_DATE + INTERVAL '20 days', TRUE)
ON CONFLICT DO NOTHING;

-- Sample Gallery Moments
INSERT INTO public.gallery_moments (title, media_type, media_url, description) VALUES
('Grand Highway Project Deployment', 'image', 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800&auto=format&fit=crop&q=80', 'Machinery fleet operating at the new express highway construction site.'),
('Equipment Inspection & Service', 'image', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80', 'Routine maintenance conducted by our certified technical team.')
ON CONFLICT DO NOTHING;

-- Sample Partner Machinery Requests
INSERT INTO public.partner_machinery_requests (organization_name, contact_name, contact_email, contact_phone, address, machinery_name, machinery_type, plate_number, quantity, proposed_rate, agreement_duration, description, image_url, status, is_seen) VALUES
('Sur Construction PLC', 'Eng. Dawit Tesfaye', 'dawit.t@surconstruction.com', '+251 911 456 789', 'Kirkos Subcity, Addis Ababa', 'CAT D9T Heavy Duty Crawler Bulldozer', 'Bulldozer', 'ET-90211-AA', 2, 165.00, '6 Months (Aug 2026 - Feb 2027)', '350HP crawler bulldozer in excellent condition with ripper attachment. Full maintenance history available.', 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80', 'Pending', FALSE),
('Sunshine Construction Ltd', 'Bethlehem Assefa', 'info@sunshineconstruction.et', '+251 929 112 334', 'Bole Medhanealem, Addis Ababa', 'SANY 75-Ton Mobile Telescopic Crane', 'Crane', 'ET-88304-AA', 1, 240.00, '1 Year Contract', '75-ton lattice boom crane ready for heavy bridge erection and structural lifting. Certified operator provided.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80', 'Approved', TRUE)
ON CONFLICT DO NOTHING;

-- Sample Categorized Reports
INSERT INTO public.reports (sender_role, title, content, report_type, status, is_seen, registrar_comments) VALUES
('Site Worker', 'Hydraulic Pressure Check & Maintenance Alert', 'Logged 12 hrs on Modjo Express Highway site. Minor hydraulic fluid leak noticed on arm cylinder of CAT 320 Excavator. Requires preventive maintenance seal kit replacement.', 'Condition Update', 'Pending', FALSE, NULL),
('Store Manager', 'Spare Parts Inventory Audit & Defective Rollers', 'Stock count finished for Akaki Central Depot. 4 excavator track shoes damaged during transport. Request replacement order approval.', 'Inventory Audit', 'Reviewed', TRUE, 'Replacement parts order authorized with supplier.'),
('Accountant', 'Monthly Revenue & Fuel Expense Audit Report', 'Total machinery rental revenue collected: $45,200. Total diesel fuel and site transport expenses: $12,800. Net margin calculated.', 'Financial Audit', 'Approved', TRUE, 'Reconciled with bank deposit records.'),
('Finance', 'Quarterly Machinery Fleet Acquisition Budget Proposal', 'Proposed budget allocation of $350,000 for acquiring 2 new 30-ton mobile cranes and emergency breakdown fund.', 'Budget Proposal', 'Pending', FALSE, NULL),
('Manager', 'Consolidated Site Operations & Shift Roster Report', 'All 18 site operators dispatched to highway and dam construction sites. Zero downtime recorded for past 7 days.', 'Operational Roster', 'Pending', FALSE, NULL),
('External Partner', 'Partner Organization Rental Agreement Review Request', 'Submitted agreement proposal to rent 3 Komatsu bulldozers to Machinery Rent organization for 6-month highway contract.', 'Partner Agreement', 'Pending', FALSE, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 14. SUPABASE STORAGE BUCKETS (Optional Public Buckets)
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
('machinery-images', 'machinery-images', true),
('user-avatars', 'user-avatars', true),
('applicant-documents', 'applicant-documents', true),
('partner-uploads', 'partner-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 15. DISABLE ROW LEVEL SECURITY (RLS) FOR UNIVERSAL API ACCESS
-- Ensures all devices (mobile, desktop) can read/write data in real time
-- ============================================================
ALTER TABLE public.portal_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.machinery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_shifts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_machinery_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancy_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_moments DISABLE ROW LEVEL SECURITY;

-- Permissive policies if RLS is ever enabled
DO $$ 
DECLARE 
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public full access policy" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Public full access policy" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;


