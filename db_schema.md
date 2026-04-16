-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.families (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_profile_id uuid NOT NULL UNIQUE,
  primary_home_city text NOT NULL,
  preferred_schedule_options ARRAY NOT NULL DEFAULT '{}'::schedule_option[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT families_pkey PRIMARY KEY (id),
  CONSTRAINT families_parent_profile_id_fkey FOREIGN KEY (parent_profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  preferred_contact_method USER-DEFINED NOT NULL DEFAULT 'email'::contact_method,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_admin boolean NOT NULL DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.semesters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT semesters_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  semester_id uuid NOT NULL,
  submitted_by_profile_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::application_status,
  device_available USER-DEFINED NOT NULL DEFAULT 'none'::device_type,
  shares_device_with_sibling boolean NOT NULL DEFAULT false,
  operating_system USER-DEFINED,
  has_coding_experience boolean NOT NULL DEFAULT false,
  coding_tools_used text,
  comfort_level USER-DEFINED NOT NULL DEFAULT 'beginner'::comfort_level,
  student_why_join text NOT NULL,
  student_what_to_build_or_learn text NOT NULL,
  additional_parent_comments text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT student_applications_pkey PRIMARY KEY (id),
  CONSTRAINT student_applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT student_applications_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id),
  CONSTRAINT student_applications_submitted_by_profile_id_fkey FOREIGN KEY (submitted_by_profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.student_interest_ratings (
  application_id uuid NOT NULL,
  category USER-DEFINED NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT student_interest_ratings_pkey PRIMARY KEY (application_id, category),
  CONSTRAINT student_interest_ratings_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.student_applications(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  full_name text NOT NULL,
  relationship_to_student text NOT NULL,
  birth_date date,
  grade_level text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id)
);