--
-- PostgreSQL database dump
--

\restrict BMvhrFgc2exqvexqrcuGli8xV64Nh4Omda0p2gUPNlj76u9hqxsgyTgzDSzb8Me

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_history (
    id integer NOT NULL,
    report_id integer,
    actor_id integer,
    action_type character varying(50) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.action_history OWNER TO postgres;

--
-- Name: action_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.action_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.action_history_id_seq OWNER TO postgres;

--
-- Name: action_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_history_id_seq OWNED BY public.action_history.id;


--
-- Name: alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerts (
    id integer NOT NULL,
    user_id integer,
    region character varying(100),
    message text NOT NULL,
    type character varying(50) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.alerts OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_id_seq OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: auth_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_otps (
    id integer NOT NULL,
    login_identifier text NOT NULL,
    login_type text NOT NULL,
    otp_hash text NOT NULL,
    otp_salt text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    attempts_left integer DEFAULT 5 NOT NULL,
    request_count integer DEFAULT 1 NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    verified_at timestamp with time zone,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT auth_otps_login_type_check CHECK ((login_type = ANY (ARRAY['phone'::text, 'email'::text])))
);


ALTER TABLE public.auth_otps OWNER TO postgres;

--
-- Name: auth_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_otps_id_seq OWNER TO postgres;

--
-- Name: auth_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_otps_id_seq OWNED BY public.auth_otps.id;


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.businesses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    region character varying(100),
    base_risk_score integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.businesses OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.businesses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.businesses_id_seq OWNER TO postgres;

--
-- Name: businesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.businesses_id_seq OWNED BY public.businesses.id;


--
-- Name: guides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guides (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    languages character varying(255),
    rating numeric(3,1),
    photo_url character varying(500),
    status character varying(50) DEFAULT 'Active'::character varying,
    risk_score integer DEFAULT 0
);


ALTER TABLE public.guides OWNER TO postgres;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    concern_type text NOT NULL,
    business_name text,
    description text,
    latitude double precision,
    longitude double precision,
    media_urls text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'pending'::text,
    user_id integer NOT NULL,
    region text,
    risk_score integer DEFAULT 0,
    business_id integer,
    reviewed_by integer,
    reviewed_at timestamp with time zone,
    reviewer_notes text,
    assigned_to integer
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    phone text,
    email text,
    role text DEFAULT 'tourist'::text NOT NULL,
    name text,
    language text DEFAULT 'English'::text,
    avatar_url text,
    token_version integer DEFAULT 0 NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    region text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: action_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_history ALTER COLUMN id SET DEFAULT nextval('public.action_history_id_seq'::regclass);


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: auth_otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_otps ALTER COLUMN id SET DEFAULT nextval('public.auth_otps_id_seq'::regclass);


--
-- Name: businesses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses ALTER COLUMN id SET DEFAULT nextval('public.businesses_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: action_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.action_history (id, report_id, actor_id, action_type, notes, created_at) FROM stdin;
1	4	1	Status updated to resolved		2026-09-04 19:35:09.310217+05:30
2	5	1	Status updated to investigating		2026-09-04 19:54:25.440783+05:30
3	7	1	Status updated to investigating		2026-09-04 22:23:04.058216+05:30
4	8	1	Status updated to invalid		2026-09-05 00:56:54.942304+05:30
5	2	1	Status updated to invalid		2026-09-05 00:57:19.424732+05:30
6	7	1	Status updated to invalid		2026-09-05 00:57:48.994381+05:30
7	7	1	Status updated to invalid		2026-09-05 00:57:50.568919+05:30
8	7	1	Status updated to invalid		2026-09-05 00:57:51.773415+05:30
9	9	1	Status updated to invalid		2026-09-05 01:23:28.397932+05:30
10	10	1	Status updated to investigating		2026-09-05 11:05:31.285144+05:30
11	10	1	Status updated to resolved		2026-09-05 11:06:02.002244+05:30
12	6	1	Status updated to resolved		2026-09-05 11:08:42.290938+05:30
13	5	1	Status updated to resolved		2026-09-05 11:08:49.712147+05:30
14	11	1	Status updated to investigating		2026-09-05 11:21:18.502337+05:30
15	11	1	Status updated to resolved		2026-09-05 11:21:53.496939+05:30
16	15	1	Status updated to investigating		2026-09-06 12:24:08.286991+05:30
17	15	1	Status updated to escalated		2026-09-06 12:24:20.355641+05:30
18	15	1	Status updated to resolved		2026-09-06 12:24:23.106938+05:30
19	15	1	Status updated to resolved		2026-09-06 12:24:24.077989+05:30
20	15	1	Status updated to resolved		2026-09-06 12:24:24.276045+05:30
21	15	1	Status updated to resolved		2026-09-06 12:24:24.45917+05:30
22	15	1	Status updated to investigating		2026-09-06 12:46:41.075963+05:30
23	15	1	Status updated to resolved		2026-09-06 12:47:14.150447+05:30
24	19	1	Status updated to invalid		2026-09-07 09:46:14.516423+05:30
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerts (id, user_id, region, message, type, is_read, created_at) FROM stdin;
1	\N	Jaipur South	New high-priority report at ejnk	warning	f	2026-09-04 19:33:34.101918+05:30
2	\N	Jaipur South	New high-priority report at 123456	warning	f	2026-09-04 19:53:35.646747+05:30
3	\N	Jaipur South	New high-priority report at SBIT	warning	f	2026-09-04 21:30:22.719571+05:30
4	\N	Jaipur South	New high-priority report at Mohak	warning	f	2026-09-04 21:33:48.061912+05:30
5	\N	Jaipur South	New high-priority report at Tara Singh	warning	f	2026-09-04 22:19:43.813826+05:30
6	\N	Jaipur South	New high-priority report at SRI KRISHNA	warning	f	2026-09-05 01:21:54.885969+05:30
7	\N	Jaipur South	New high-priority report at SRI KRISHNA	warning	f	2026-09-05 11:03:54.121542+05:30
8	\N	Jaipur South	New high-priority report at Fraud	warning	f	2026-09-05 11:17:35.735421+05:30
9	\N	Jaipur South	New high-priority report at unknow	warning	f	2026-09-06 12:21:50.47304+05:30
10	\N	Jaipur South	New high-priority report at SRI KRISHNA	warning	f	2026-09-06 12:48:27.033308+05:30
11	\N	Jaipur South	New high-priority report at The Bikers Cafe	warning	f	2026-09-06 13:03:19.45421+05:30
12	\N	Jaipur South	New high-priority report at Lord Yash	warning	f	2026-09-06 13:07:20.924236+05:30
13	\N	Jaipur South	New high-priority report at Lord Yash	warning	f	2026-09-07 09:43:16.451641+05:30
14	\N	Jaipur South	New high-priority report at The Bikers Cafe	warning	f	2026-09-07 11:46:25.25427+05:30
15	\N	Jaipur South	New high-priority report at Indian Institute of Information Technology Sonepat	warning	f	2026-09-26 01:17:55.82662+05:30
16	\N	Jaipur South	New high-priority report at Nothing	warning	f	2026-09-26 01:49:17.086108+05:30
17	\N	Jaipur South	New high-priority report at nothing	warning	f	2026-09-26 02:54:19.524949+05:30
\.


--
-- Data for Name: auth_otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_otps (id, login_identifier, login_type, otp_hash, otp_salt, expires_at, attempts_left, request_count, sent_at, verified_at, used_at, created_at) FROM stdin;
1	+919625213875	phone	0fdb0097316a477b0d11a5e5aaeaa803a0eba50c5cc8f78988c187d4e216d9ebeea4b81de692042ceaf36630ca207a06242b744739d60c7547ec426c1c2a64f4	dfc4cbd364bad4c44affffc7f10f1b3c	2026-09-02 15:33:10.708+05:30	5	1	2026-09-02 15:28:10.708955+05:30	2026-09-02 15:28:15.407112+05:30	2026-09-02 15:28:15.407112+05:30	2026-09-02 15:28:10.708955+05:30
2	+919625213875	phone	f8683af24316aeae4a49a90eec8ac3cd5118b8b7cb9d08c7840b04ab4a38926bce4dae537858a505d3d85c33f7c47eb8d0426b6e773ae0cf1fd768f1052063a9	53905a46c1515f83146a011106442084	2026-09-02 15:33:44.722+05:30	5	1	2026-09-02 15:28:44.723057+05:30	2026-09-02 15:28:48.489396+05:30	2026-09-02 15:28:48.489396+05:30	2026-09-02 15:28:44.723057+05:30
3	+919625213875	phone	a4022133a017dd04be4f0e1b4e1185699f89b7ac5f6766037dcb7d487df5a1fa234cf214aa3ffdb37953445a7b82acaa3fdf82f8a3a8060b127fd79cb1b6bb39	6defca2e160aec968e612957bf02fd0f	2026-09-02 15:34:36.719+05:30	5	1	2026-09-02 15:29:36.720576+05:30	2026-09-02 15:29:40.356002+05:30	2026-09-02 15:29:40.356002+05:30	2026-09-02 15:29:36.720576+05:30
4	+919625213875	phone	80f7d301c4bf89d6df77cde0a733e0ede7cc1869246e4d9891e832f1a6f783b41b52fac442024a2866148ee9c52aaaefb2dd0216cfc524e0382313211ea6bd2d	4dd878dc6f8a62f9bffe00e4f3dde7a8	2026-09-02 15:34:54.966+05:30	5	1	2026-09-02 15:29:54.96787+05:30	2026-09-02 15:29:58.211894+05:30	2026-09-02 15:29:58.211894+05:30	2026-09-02 15:29:54.96787+05:30
5	+919625213875	phone	ea2cca62b932d0052098188878f7bdf332b0193cace7443805e3ad2edd7fd1a19409410a2270ab11f8aa6e8e6cc9275ec59c846c456ae761cb71cb615f52e231	2a6f9defebc68b5c729cbb76704947f3	2026-09-04 10:14:44.139+05:30	5	1	2026-09-04 10:09:44.14065+05:30	2026-09-04 10:09:47.127287+05:30	2026-09-04 10:09:47.127287+05:30	2026-09-04 10:09:44.14065+05:30
6	mohakcse12511069@iiitsonepat.ac.in	email	5147420a95b7308a6d65ca119980a8c1327b5ef7deb85d3c654b68a6b1cb14c31f4f5f3fe519ab38ca2e62e6f624525df2c0e8daa2435472deb8f3636743d75d	cfbacf1273eb4c005b0b5661b174afd0	2026-09-04 11:48:24.321+05:30	5	1	2026-09-04 11:43:24.322172+05:30	2026-09-04 11:43:27.549953+05:30	2026-09-04 11:43:27.549953+05:30	2026-09-04 11:43:24.322172+05:30
7	+919625213875	phone	dcd1a54d720bcb73c641b305548574470da8438eb5676472b868386b2bf3fbbb07339f19beb02bf5dd35e56c8700c1c2f3bb2b3dcd0369fc5aa7ac365f4ab79f	4b33022b4abadb94c245414ca40b3113	2026-09-04 11:57:15.729+05:30	5	1	2026-09-04 11:52:15.730867+05:30	2026-09-04 11:52:19.323284+05:30	2026-09-04 11:52:19.323284+05:30	2026-09-04 11:52:15.730867+05:30
8	+919625213875	phone	efb583a20d5e44af51ffa44a7882bd3f99571df865510f383a65f94ee490e50d4a1275073c0b3c4c8b20b750fd640a2ebe6dc2f8ea96c484661a377d299c70ee	5964ce40b8ce1d63ea3fe7bd2144cb68	2026-09-04 12:40:50.253+05:30	5	1	2026-09-04 12:35:50.255113+05:30	2026-09-04 12:35:52.636422+05:30	2026-09-04 12:35:52.636422+05:30	2026-09-04 12:35:50.255113+05:30
9	+919625213875	phone	52316e78f58e1c5c390260cba0f478485e20a7082e3d5f8b98bcadb6acff0c842179dc1dd29d478b0be614571ed2a96b379d152a45d74c054796a9af63c3f9f7	e9d7e8e6d5309ae6bc10af27fca1c49a	2026-09-04 19:02:22.505+05:30	5	1	2026-09-04 18:57:22.506518+05:30	2026-09-04 18:57:24.915601+05:30	2026-09-04 18:57:24.915601+05:30	2026-09-04 18:57:22.506518+05:30
10	mohakcse12511069@iiitsonepat.ac.in	email	cd7b0c7320615538a1d1fbb08f7287db3fae47b6a4a5b363d4784ecd485eede4e07e255badbb46767f92980840bdcda53c456e4d5a4a2d650651e73df29fa466	ca88720abd6114b03cde44bba751e0ee	2026-09-04 19:39:01.261+05:30	5	1	2026-09-04 19:34:01.262917+05:30	2026-09-04 19:34:04.317916+05:30	2026-09-04 19:34:04.317916+05:30	2026-09-04 19:34:01.262917+05:30
11	+919625213875	phone	a28217dc08182ef933f98dbc1fd676a927bb2fe49e408597f23c0c612805c9f99799650a91a38f475458114d16e53facbc62f4a6561cdc9a694ce6e1c9580a71	dc7b83ba3abc6acae80de836915987e3	2026-09-04 19:40:26.135+05:30	5	1	2026-09-04 19:35:26.137838+05:30	2026-09-04 19:35:28.544617+05:30	2026-09-04 19:35:28.544617+05:30	2026-09-04 19:35:26.137838+05:30
12	mohakcse12511069@iiitsonepat.ac.in	email	ba14ebc3975156d7c1c367f7f7791bcf4419c50c31295152bc07fa6ddc729e9b9a67bb51420e80855993181de7cfcc498bfa43b2ce8d9f7692c33a3edf81a470	bc9aabd51dc7780e45b47b2cbc8dea32	2026-09-04 19:58:57.445+05:30	5	1	2026-09-04 19:53:57.44677+05:30	2026-09-04 19:54:00.90655+05:30	2026-09-04 19:54:00.90655+05:30	2026-09-04 19:53:57.44677+05:30
13	+919625213875	phone	4e9ff55e6a56cb0f4007e99f856374d604c3c5a24c4438e030843e5e2ce32ceb64d1826f9b579977d2136b2e3a79bb293c9e83a0e3e86fcb84d315f43824d065	d934ad2d47010d1aa78e8bf29f4fbb85	2026-09-04 20:07:05.025+05:30	5	1	2026-09-04 20:02:05.026499+05:30	2026-09-04 20:02:08.338645+05:30	2026-09-04 20:02:08.338645+05:30	2026-09-04 20:02:05.026499+05:30
14	mohakcse12511069@iiitsonepat.ac.in	email	a02efafb940f295749eead6338dd67fcc022f9125a83725147a14b7281112ae9bed6365e0a996b1b5f8c21b066ac2dd8588ca1d04bc13f6f7d9bd071980b5889	26cea3939d46f57afd54838e8cd3de7a	2026-09-04 21:35:45.344+05:30	5	1	2026-09-04 21:30:45.346604+05:30	2026-09-04 21:30:48.680673+05:30	2026-09-04 21:30:48.680673+05:30	2026-09-04 21:30:45.346604+05:30
15	+919625213875	phone	f057f523d7baf95c6d2ba6886a56ac6b1be906bb56ee0db5bab57650ca9a8d669bc5e70b3273520dfadbe95812523cc83db2db37b67fb8c5dbc52b0f2c21b90d	e64963a404fe78b7426b532f34181e1a	2026-09-04 21:38:03.651+05:30	5	1	2026-09-04 21:33:03.652676+05:30	2026-09-04 21:33:06.171851+05:30	2026-09-04 21:33:06.171851+05:30	2026-09-04 21:33:03.652676+05:30
16	mohakcse12511069@iiitsonepat.ac.in	email	05117676d5d26f000be42d28d54b8ad8d3f0a85afc5aea88d21564daf84a87320addf00ca63478039398f0e27a7c93ebaa6853dd996da0a66a4ca64beccdf3f0	002b36d935f68dd38e8d1fbc4deee3e6	2026-09-04 21:39:10.646+05:30	5	1	2026-09-04 21:34:10.648289+05:30	2026-09-04 21:34:13.247687+05:30	2026-09-04 21:34:13.247687+05:30	2026-09-04 21:34:10.648289+05:30
17	+919625213875	phone	b3adc4441a5f5d6122a9d053b8caec8e24e04134dd32dbcf260caad208270ea66389adfa17b00d3fad540ba83fe909818e6eb8a774bb971b711fc3828e81df23	a28c82404360cad4a4f8f175474175a6	2026-09-04 22:14:12.304+05:30	5	1	2026-09-04 22:09:12.305516+05:30	2026-09-04 22:09:14.48141+05:30	2026-09-04 22:09:14.48141+05:30	2026-09-04 22:09:12.305516+05:30
18	mohakcse12511069@iiitsonepat.ac.in	email	00c87d3c330628b1c412de678fa4ce6897b894b0b6f5442639b8bd4d10b3d896546f631f5ae73e5f444543d096195f463f945b655a151b93a3556b58bb746db7	067434d2c542892e7c8dc3a37fcbffb0	2026-09-04 22:25:05.167+05:30	5	1	2026-09-04 22:20:05.168486+05:30	2026-09-04 22:20:07.259763+05:30	2026-09-04 22:20:07.259763+05:30	2026-09-04 22:20:05.168486+05:30
19	+919625213875	phone	8cf05e4582b32db660d0cc86933e0b565ead86f3707aac4a787320009c8a05828d0dd2da4d9afa4d1f7ca227166ba362e1c7f3158dfbc074aa86726a69160f5e	2b16f2ae3e09fa247218edc3b09d2c10	2026-09-05 01:01:18.651+05:30	5	1	2026-09-05 00:56:18.653157+05:30	2026-09-05 00:56:21.127706+05:30	2026-09-05 00:56:21.127706+05:30	2026-09-05 00:56:18.653157+05:30
20	mohakcse12511069@iiitsonepat.ac.in	email	8e9045bedcb17f91145e6e54c5e43fce1f21c3d1b0cd4dd2930ad1aa4dcf06c9cb5d9473f992e2e55f3ac5186cb405a5b4beba8a999edc37bb64eaa174bf528f	accca338652015a5fc306a782b986ae1	2026-09-05 01:01:43.613+05:30	5	1	2026-09-05 00:56:43.615362+05:30	2026-09-05 00:56:46.259105+05:30	2026-09-05 00:56:46.259105+05:30	2026-09-05 00:56:43.615362+05:30
21	+919625213875	phone	92fe71b5fdbfccb6dfd2f72028c00dd8e4a1c8be851f80a23e3fd4f9e772f309873762dc1792c8bddaf2e0d33caa0eeb38ccd7c80e16eaf47a1c5db841a84449	71d90edded48ec2cfe9bbd8ffd981743	2026-09-05 01:15:35.81+05:30	5	1	2026-09-05 01:10:35.811347+05:30	2026-09-05 01:10:37.788525+05:30	2026-09-05 01:10:37.788525+05:30	2026-09-05 01:10:35.811347+05:30
22	mohakcse12511069@iiitsonepat.ac.in	email	ead0813c9c3e1e8ace3a4ed6a522afd1040930c2c8dcfaa88f840c352318dc8b7de90e35b4249ee6829deeed1051147e5ab48dae067c8a1e2cbd0680dcf38c9b	1abdadfbf4c08a286e34fbbfdf61d4f3	2026-09-05 01:28:09.336+05:30	5	1	2026-09-05 01:23:09.337675+05:30	2026-09-05 01:23:11.806006+05:30	2026-09-05 01:23:11.806006+05:30	2026-09-05 01:23:09.337675+05:30
23	+919625213875	phone	340d14c28d10400307879f3c4e1ad7a8ce35d2f7dc40015a41b645c62829956f6e67e4c51c4b8acae4565a360e7e1c9da10824aefe37cfd34d4d6be3f3ee565c	10eed965407679a5cee533457e73733f	2026-09-05 01:37:37.022+05:30	5	1	2026-09-05 01:32:37.025269+05:30	2026-09-05 01:32:39.04433+05:30	2026-09-05 01:32:39.04433+05:30	2026-09-05 01:32:37.025269+05:30
24	+919625213875	phone	095cf3b2e70f36290693652ad3e7559495ae83985eb8e552fc8a9baa98368b0bcedf480c45c9566240a932bf78981eda0505a994c4a78db732c4f3789163d110	c1592157c23e554753e5568dd47f9d87	2026-09-05 11:01:09.095+05:30	5	1	2026-09-05 10:56:09.09662+05:30	2026-09-05 10:56:11.814061+05:30	2026-09-05 10:56:11.814061+05:30	2026-09-05 10:56:09.09662+05:30
25	mohakcse12511069@iiitsonepat.ac.in	email	6853a3d91da12bd3bba3568bba98ce8bad96d85c1781533817ae8ce5adae35b377e976afcb5beffd62d864aadc8a15b73ec2f95bc02e0528ffddba4c2e0d2f9f	1f34285b7c6464ea1f5f0c64ee998e1f	2026-09-05 11:02:03.24+05:30	5	1	2026-09-05 10:57:03.24179+05:30	2026-09-05 10:57:05.517297+05:30	2026-09-05 10:57:05.517297+05:30	2026-09-05 10:57:03.24179+05:30
26	+919625213875	phone	14e7678e3b4ce485d921dae3dc07121e37c03f34f214e3e7b48cd8bb0678cdd4a2a2207a046c8d1dbf702d9b9b64d8fb9959cf8b952eb5261c219db75ea4a2ca	04f0357898e69538a12b62661aabb634	2026-09-05 11:02:43.185+05:30	5	1	2026-09-05 10:57:43.187417+05:30	2026-09-05 10:57:45.968067+05:30	2026-09-05 10:57:45.968067+05:30	2026-09-05 10:57:43.187417+05:30
27	mohakcse12511069@iiitsonepat.ac.in	email	bfb913ff7712a43007ff70114b0ab07b065c8f1a6db9dcf5fff2110752d9bf87eb91c5ebdb9a6ae8319a0270efbd8423ff4989d42cb374544d537e262601525c	194e50bdc50c95761e856067e1710ba7	2026-09-05 11:09:32.423+05:30	5	1	2026-09-05 11:04:32.424447+05:30	2026-09-05 11:04:35.622124+05:30	2026-09-05 11:04:35.622124+05:30	2026-09-05 11:04:32.424447+05:30
28	+919625213875	phone	b522f0c8a4a79b4370eef9de1594b21d14a516ce7401bda94c1d8b05e275be37a71a048a98b2cb18345b881e0cb79371caf07e4c8d788e5143f88f8ed4d22cb5	5f4ba34171d24a2347c7aa7b4a4429fe	2026-09-05 11:16:30.289+05:30	5	1	2026-09-05 11:11:30.290519+05:30	2026-09-05 11:11:34.975374+05:30	2026-09-05 11:11:34.975374+05:30	2026-09-05 11:11:30.290519+05:30
29	mohakcse12511069@iiitsonepat.ac.in	email	490768ca19058154cd88508dd46ba7ecef08d480df4ab2a912ea1434962a9e36de4af11cefebfc45c6edc6a7752fe433db5e771aac22dc5d6f72fd6aff51d489	44eafe4818e4cfb5c16eeae8d0cfb745	2026-09-05 11:25:33.585+05:30	5	1	2026-09-05 11:20:33.586543+05:30	2026-09-05 11:20:35.934256+05:30	2026-09-05 11:20:35.934256+05:30	2026-09-05 11:20:33.586543+05:30
30	+919625213875	phone	11752ceb18d92bd530fa779cc9f63f7b1ffe605b9c20f2d7f5eb5369870d5aa9e9e587cc201eef08125abf50db2af60765f8ddaf9209bd974593ab5f73de2766	692ebb0a0fbfa10becaf01198a6613a5	2026-09-06 12:22:08.633+05:30	5	1	2026-09-06 12:17:08.635027+05:30	2026-09-06 12:17:10.721342+05:30	2026-09-06 12:17:10.721342+05:30	2026-09-06 12:17:08.635027+05:30
31	mohakcse12511069@iiitsonepat.ac.in	email	0b22ecfa45375078aba8981fadc18ecfc98e30696f8245528531c333f0321f5b93ab25d54d57d170d1ae02f73b75fe235560a7e12ed4846b97aa1670c05a8493	08b9e8d419a8f966c43cb59a955e85f0	2026-09-06 12:27:19.244+05:30	5	1	2026-09-06 12:22:19.246004+05:30	2026-09-06 12:22:21.90296+05:30	2026-09-06 12:22:21.90296+05:30	2026-09-06 12:22:19.246004+05:30
32	+919625213875	phone	3ccd6642ed2686fc360fb6e0d8ce27566679da107c98a480f29a9177c8f173cca41ad818d8f62503aa64c2bd5ea8b09100f5ae1e023e6e43d0b1b3c407ab8e5f	d1166f11147b4b46558e079805cc304b	2026-09-06 12:52:30.096+05:30	5	1	2026-09-06 12:47:30.09774+05:30	2026-09-06 12:47:31.947265+05:30	2026-09-06 12:47:31.947265+05:30	2026-09-06 12:47:30.09774+05:30
33	mohakcse12511069@iiitsonepat.ac.in	email	7249876cc57e61bf5ea4140f5b0b707eec283a43a8f23ee154b4323c3819e91c9b37c5816c2968843dcf9762a92819679878938c6a6d8a057be116ca0738461c	51e4695bb62ca30a77acb52b2f9c9b75	2026-09-06 12:54:30.735+05:30	5	1	2026-09-06 12:49:30.736635+05:30	2026-09-06 12:49:32.993149+05:30	2026-09-06 12:49:32.993149+05:30	2026-09-06 12:49:30.736635+05:30
34	+919625213875	phone	f1c3c78d371e07f1c77d67583d5dfac2a3f4214e50b41343493fd9d71f60cae0aaeddb7c5899996d86b9280c442c1d30d4c5883e2f9337ca37b19b841793e8ac	088072cd218943b760cc795591a117be	2026-09-06 13:07:24.66+05:30	5	1	2026-09-06 13:02:24.661463+05:30	2026-09-06 13:02:26.802542+05:30	2026-09-06 13:02:26.802542+05:30	2026-09-06 13:02:24.661463+05:30
35	mohakcse12511069@iiitsonepat.ac.in	email	5e33e0382d258074b804ce6fb42fe907bd24ede86fe85c1666ce2a65672d7c8d1d6983ffa298bdf8bfd4bd9b8aa48ff3e89c3953f654d51490774ca7d4e3681e	7d6cb04775269c8290c2e79e45b3916d	2026-09-06 13:08:25.301+05:30	5	1	2026-09-06 13:03:25.302475+05:30	2026-09-06 13:03:28.775092+05:30	2026-09-06 13:03:28.775092+05:30	2026-09-06 13:03:25.302475+05:30
36	+919625213875	phone	f66fc9b54a1b6734446c0886d21b4987b2034b2ad649347f886234b726b812ddad1912075b7f2f3cac182d5f8210739cc6b5dee0597c83acf7089e0353e12abe	31f1f48b3d09e3016c7121fa99c7cf19	2026-09-06 13:11:32.397+05:30	5	1	2026-09-06 13:06:32.397882+05:30	2026-09-06 13:06:34.946785+05:30	2026-09-06 13:06:34.946785+05:30	2026-09-06 13:06:32.397882+05:30
37	mohakcse12511069@iiitsonepat.ac.in	email	6c43aff69b23d6adc248fdd46b1d3c1c06ef31715040c5c6ad591e1ea0f5553fe1c63b8bade6dd554dda4322e1b08a859d55aabea7c52eb11cfedb903951977c	71ba9c4963488e3086fbd294b2bda1b2	2026-09-06 13:12:25.809+05:30	5	1	2026-09-06 13:07:25.810394+05:30	2026-09-06 13:07:27.963171+05:30	2026-09-06 13:07:27.963171+05:30	2026-09-06 13:07:25.810394+05:30
38	+919625213875	phone	284cbe259587b12428a58811934f931dfbb1e9d340775ee97d1ae9265b5536cf197d585121196308b291dc78ef6d6f190424f92c2cbf2cbd6112c8fa634c7306	ac4383134e69aafa509f9be7601acf72	2026-09-07 09:43:50.686+05:30	5	1	2026-09-07 09:38:50.688094+05:30	2026-09-07 09:38:55.816808+05:30	2026-09-07 09:38:55.816808+05:30	2026-09-07 09:38:50.688094+05:30
39	mohakcse12511069@iiitsonepat.ac.in	email	efda434bd953dd005388a0ea70543dcf1b486a7821613073996b7487b2134325e88ad1f40380c40b7abfaae6aa4f46156fddc58bbb465950276533a847f74494	543e614b8569109996a190f77f131853	2026-09-07 09:48:32.276+05:30	5	1	2026-09-07 09:43:32.278424+05:30	2026-09-07 09:43:34.92977+05:30	2026-09-07 09:43:34.92977+05:30	2026-09-07 09:43:32.278424+05:30
40	+919625213875	phone	303a849dc8635d08c702a6fb06ca6cf8b341279b79f1fb6c08fa4d2ec8571846d53d779e2b7ea9ec666e13ea52664a67dc2aa6b80a4826231f102a0e8e438b29	3c75f6ed649241d126fd5fb65e93b651	2026-09-07 10:09:24.589+05:30	5	1	2026-09-07 10:04:24.59057+05:30	2026-09-07 10:04:28.487733+05:30	2026-09-07 10:04:28.487733+05:30	2026-09-07 10:04:24.59057+05:30
41	mohakcse12511069@iiitsonepat.ac.in	email	a8ddc415829c40145977df4a47040bb34abee9d4385f8d821e4968b80af29061b3547568dc86196ff06b774fe06524f08e5090d097b641ecaa43afe8c1e3d28b	14a49ea24225af69abb6ad9d82aa0064	2026-09-07 11:51:35.304+05:30	5	1	2026-09-07 11:46:35.305821+05:30	2026-09-07 11:46:39.488624+05:30	2026-09-07 11:46:39.488624+05:30	2026-09-07 11:46:35.305821+05:30
42	+919625213875	phone	b55befb588eac707845308620b02ec8d5e7543fe201a7269a95b75ecb96d5049305e7286d98debfdda7e90836d64e4eeb755fdab8e1cc90804a5d2d0a64dce42	0ee7c55ba41c05a87ff2fb823d20fa6f	2026-09-08 19:37:52.308+05:30	5	1	2026-09-08 19:32:52.309985+05:30	2026-09-08 19:32:55.990625+05:30	2026-09-08 19:32:55.990625+05:30	2026-09-08 19:32:52.309985+05:30
43	+919625213875	phone	11d51e7bf0ad0fd8411a405c6176237446b9a8b7f63adbc47d2ab42343bf15c6e1d979fc373e32425fa8c3ee8419f3c9ead6def55e24c9c69fb26eaa59acc28f	00c2a04221c183216c6f1ba202b83418	2026-09-08 19:39:02.224+05:30	5	1	2026-09-08 19:34:02.225911+05:30	2026-09-08 19:34:05.678468+05:30	2026-09-08 19:34:05.678468+05:30	2026-09-08 19:34:02.225911+05:30
44	+919625213875	phone	20f5813a36e782a7b3f96cc339c293e1da28a4a222208084a3b389ec18e866820f10adb79d8dd35a2d397be4b1106ab3ff72fda68eb2d8b4121cba3a238a41be	59339750f55c5070afe2579a6304b2c6	2026-09-26 00:49:40.629+05:30	5	1	2026-09-26 00:44:40.631122+05:30	2026-09-26 00:44:45.03073+05:30	2026-09-26 00:44:45.03073+05:30	2026-09-26 00:44:40.631122+05:30
45	+919625213875	phone	21c4f103615da5d9cb8f235aa8e5db17b9be245dcc20bed505aad4e494ce8851898765aad4c41b8663f02d92972785013b17faaaccfa61c77b6c8c76db7b33a4	b0d9b3507b8522165ae99867cb7446b3	2026-09-26 00:50:00.359+05:30	5	1	2026-09-26 00:45:00.360564+05:30	2026-09-26 00:45:04.843898+05:30	2026-09-26 00:45:04.843898+05:30	2026-09-26 00:45:00.360564+05:30
46	+919625213877	phone	7a0f52cc27b586694f254d004f667c8e209da538ab53ef3f6e792230fd958e5a51c3faf0952851609e5803e2e9336935f07774062c9e3c182cdf5605f3eb711a	6a5912f6d631ca8481fc01fb8ff28a33	2026-09-26 14:21:21.305+05:30	5	1	2026-09-26 14:16:21.306719+05:30	2026-09-26 14:16:23.478745+05:30	2026-09-26 14:16:23.478745+05:30	2026-09-26 14:16:21.306719+05:30
47	+919625213875	phone	3c34df4083d75165e8af68f030c024599d3b460a371a82a15fdbbf6c85b7da27a481b15e0b0b4e1a792b61879b84e06a97bf2c3a01c162c9c53e016453c331a0	c895ed5c3eab3228eb0c79066ab0d846	2026-09-26 14:21:31.337+05:30	5	1	2026-09-26 14:16:31.338325+05:30	2026-09-26 14:16:33.930499+05:30	2026-09-26 14:16:33.930499+05:30	2026-09-26 14:16:31.338325+05:30
48	mohakcse12511069@iiitsonepat.ac.in	email	c1c3e4b3ca2709f99d99b301df2aa6017e19816df08f7716c3a48770fea81984df5b5ec961d2faa1ed4d262b6a52eee553a35657efa422ee6c2744c824365564	46c95bd4f2e485081b194ab722ffced1	2026-09-26 14:22:01.788+05:30	5	1	2026-09-26 14:17:01.789596+05:30	2026-09-26 14:17:03.766842+05:30	2026-09-26 14:17:03.766842+05:30	2026-09-26 14:17:01.789596+05:30
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.businesses (id, name, region, base_risk_score, created_at) FROM stdin;
1	ejnk	Jaipur South	10	2026-09-04 19:33:34.085939+05:30
2	123456	Jaipur South	10	2026-09-04 19:53:35.625441+05:30
3	SBIT	Jaipur South	10	2026-09-04 21:30:22.713278+05:30
4	Mohak	Jaipur South	10	2026-09-04 21:33:48.054516+05:30
5	Tara Singh	Jaipur South	10	2026-09-04 22:19:43.810482+05:30
7	Fraud	Jaipur South	10	2026-09-05 11:17:35.726565+05:30
8	Saffron Courtyard (Demo)	Jaipur	84	2026-09-06 12:08:16.504227+05:30
9	Laxmi Mishthan Bhandar (Demo)	Jaipur	10	2026-09-06 12:08:16.51318+05:30
10	Highway Dhaba 99 (Demo)	Jaipur	45	2026-09-06 12:08:16.514881+05:30
11	unknow	Jaipur South	10	2026-09-06 12:21:50.456364+05:30
6	SRI KRISHNA	Jaipur South	40	2026-09-05 01:21:54.866176+05:30
13	Lord Yash	Jaipur South	25	2026-09-06 13:07:20.917305+05:30
12	The Bikers Cafe	Jaipur South	25	2026-09-06 13:03:19.448386+05:30
14	Indian Institute of Information Technology Sonepat	Jaipur South	10	2026-09-26 01:17:55.792651+05:30
15	Nothing	Jaipur South	25	2026-09-26 01:49:17.066069+05:30
\.


--
-- Data for Name: guides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guides (id, name, languages, rating, photo_url, status, risk_score) FROM stdin;
IITG-2024-001	Ramesh Sharma	English, Hindi	4.8	\N	Active	0
IITG-2024-002	Amit Patel	Gujarati, Hindi	4.5	\N	Active	0
IITG-2024-003	Sunita Reddy	Telugu, English	4.9	\N	Active	0
IITG-2024-004	Arun Kumar	Tamil, English	4.2	\N	Active	0
IITG-2024-005	Priya Singh	Hindi, French	4.7	\N	Active	0
IITG-2024-006	Vikram Singh	Hindi, English	4.6	\N	Active	0
IITG-2024-007	Neha Gupta	English, German	4.4	\N	Active	0
IITG-2024-008	Rajesh Khanna	Hindi, Marathi	4.1	\N	Active	0
IITG-2024-009	Anjali Desai	Gujarati, English	4.8	\N	Active	0
IITG-2024-010	Kiran Rao	Kannada, English	4.9	\N	Active	0
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, concern_type, business_name, description, latitude, longitude, media_urls, created_at, status, user_id, region, risk_score, business_id, reviewed_by, reviewed_at, reviewer_notes, assigned_to) FROM stdin;
1	Safety concern	Test Biz	Test report 0	26.9	75.8	\N	2026-09-04 19:25:12.849495+05:30	new	77	Jaipur South	10	\N	\N	\N	\N	1
3	Safety concern	Test Biz	Test report 2	26.9	75.8	\N	2026-09-04 19:25:12.86968+05:30	new	77	Jaipur South	10	\N	\N	\N	\N	1
4	Overcharging or unclear bill	ejnk	1234567	28.986850681355936	77.15092554289956	\N	2026-09-04 19:33:34.092697+05:30	resolved	11	Jaipur South	10	1	1	2026-09-04 19:35:09.304206+05:30	\N	1
11	Overcharging or unclear bill	Fraud	AI Scan detected the following issues:\r\n- Use of obsolete tax structure (VAT/Service Tax) instead of mandatory GST\r\n- Incorrect mathematical calculations for tax percentages\r\n- Missing GSTIN and merchant identification details\r\n- Inconsistent subtotal and itemized pricing logic\r\n- Service Charge (676.00) is not exactly 10% of Subtotal (677.00)\r\n- VAT 12.5% calculated as 801.00 instead of 846.25\r\n- VAT 20% calculated as 208.00 instead of 1354.00\r\n- Final Total does not match the sum of items (6770 + 676 + 801 + 208 + 368 = 8823)	28.98763543311017	77.15071309453177	\N	2026-09-05 11:17:35.729896+05:30	resolved	11	Jaipur South	75	7	1	2026-09-05 11:21:53.492789+05:30	\N	1
12	Pricing issue	Saffron Courtyard (Demo)	They charged me GST twice on the bill and inflated the price of water bottles. Very suspicious.	26.9124	75.7873	\N	2026-09-06 12:08:16.517288+05:30	new	123	Jaipur	84	8	\N	\N	AI_JSON: {"modifier":59,"signals":["Arithmetic mismatch","Tax inconsistency","Price anomaly","Repeat merchant complaints"],"reasoning":"The scanned bill exhibits illegal tax surcharges and significant overcharging compared to standard rates."}	\N
8	Overcharging or unclear bill	Tara Singh	AI Scan detected the following issues:\r\n- Use of obsolete tax structure (VAT and Service Tax instead of GST).\r\n- Calculation error: Service Charge 10% of 6770 is 677, but 676 is billed.\r\n- Calculation error: VAT 12.5% of 6770 is 846.25, but 801 is billed.\r\n- Calculation error: VAT 20% of 6770 is 1354, but 208 is billed.\r\n- Mathematical inconsistency: Subtotal + listed charges (6770+676+801+208+368) equals 8823, but the individual tax calculations provided are mathematically invalid.\r\n- Lack of merchant details, invoice number, and date.\r\n- Multiple arbitrary VAT percentages (12.5% and 20%) used simultaneously.\r\n- Presence of 'Service Tax' which was superseded by GST in 2017, suggesting an outdated or fraudulent template.	28.987192046295206	77.1506673437187	\N	2026-09-04 22:19:43.812154+05:30	invalid	11	Jaipur South	10	5	1	2026-09-05 00:56:54.925029+05:30	\N	1
2	Safety concern	Test Biz	Test report 1	26.9	75.8	\N	2026-09-04 19:25:12.867073+05:30	invalid	77	Jaipur South	10	\N	1	2026-09-05 00:57:19.411322+05:30	\N	1
10	Overcharging or unclear bill	SRI KRISHNA	AI Scan detected the following issues:\r\n- Mathematical error: Discount calculation (10% of 65.00 is 6.50, bill shows 6.00)\r\n- Mathematical error: Tax calculation (9% of 59.00 is 5.31, which is correct, but tax is applied to post-discount amount incorrectly or inconsistently)\r\n- Mathematical error: Grand Total calculation (59.00 + 5.31 + 5.31 = 69.62, not 70.00)\r\n- Inconsistent Date/Tax Logic: Bill dated 01/07/17 (the day GST was implemented in India) containing both GST and pre-GST style formatting inconsistencies.\r\n- Discount amount calculated as 6.00 instead of 6.50\r\n- Grand Total rounded up to 70.00 from calculated 69.62	28.987192046295206	77.1506673437187	\N	2026-09-05 11:03:54.108453+05:30	resolved	11	Jaipur South	25	6	1	2026-09-05 11:06:01.989491+05:30	\N	1
6	Overcharging or unclear bill	SBIT	Prices was way too high and the service was really bad	28.987449681064607	77.15051412953443	\N	2026-09-04 21:30:22.715934+05:30	resolved	11	Jaipur South	15	3	1	2026-09-05 11:08:42.279222+05:30	\N	1
7	Safety concern	Mohak	i am feeling unsafe here life threatening	28.98703121768038	77.15084325967041	\N	2026-09-04 21:33:48.058518+05:30	invalid	11	Jaipur South	100	4	1	2026-09-05 00:57:51.763195+05:30	\N	1
5	Overcharging or unclear bill	123456	123456	28.98720191471455	77.15058472734957	\N	2026-09-04 19:53:35.636745+05:30	resolved	11	Jaipur South	10	2	1	2026-09-05 11:08:49.70379+05:30	\N	1
9	Overcharging or unclear bill	SRI KRISHNA	AI Scan detected the following issues:\r\n- Mathematical error: Discount calculation (10% of 65 is 6.5, not 6.0)\r\n- Mathematical error: Subtotal (59.00) + CGST (5.31) + SGST (5.31) = 69.62, not 70.0\r\n- Inconsistent Tax Logic: GST was implemented on 01/07/2017, the exact date on this bill. It is highly irregular for a small counter-service restaurant to have a fully formatted GST bill with a specific GSTIN on the very first day of the rollout.\r\n- Tax logic failure: GST is calculated on the discounted subtotal (59.00). 9% of 59.00 is 5.31. While the tax math is consistent with the flawed subtotal, the bill's rounding logic to reach a 'Grand Total' of 70 is arbitrary.\r\n- Calculation of discount percentage is mathematically inaccurate\r\n- Final Grand Total does not match the sum of Net Total + Taxes	28.98720191471455	77.15058472734957	\N	2026-09-05 01:21:54.872799+05:30	invalid	11	Jaipur South	65	6	1	2026-09-05 01:23:28.386652+05:30	\N	1
23	Overcharging or unclear bill	nothing	AI Scan detected the following issues:\r\n- The provided image is a screenshot of a video game (Minecraft/CubeCraft) and does not represent a financial bill or invoice.\r\n- No merchant information, tax details, or pricing structure found.\r\n- No currency or financial transaction data detected in the image.	28.9889282	77.1501616	{"/uploads/8f482ebcb6c79f25dcab2e79f8543d68"}	2026-09-26 02:54:19.5121+05:30	new	11	Jaipur South	25	15	\N	\N	\N	1
13	Misleading service	Highway Dhaba 99 (Demo)	The food was not what they promised on the menu, and they refused to change it.	26.845	75.73	\N	2026-09-06 12:08:16.528311+05:30	investigating	123	Jaipur	45	10	\N	\N	AI_JSON: {"modifier":20,"signals":["Service discrepancy"],"reasoning":"The menu prices slightly differ from the final bill, possibly due to outdated menus."}	\N
14	Safety concern	Laxmi Mishthan Bhandar (Demo)	The table was slightly dirty when we sat down.	26.9218	75.8082	\N	2026-09-06 12:08:16.530449+05:30	invalid	123	Jaipur	10	9	\N	\N	AI_JSON: {"modifier":0,"signals":["No fraud indicators"],"reasoning":"The bill appears standard and all calculations are correct."}	\N
24	Overcharging / Fake Guide	Hawa Mahal Area	SIH Demo Data	26.9239	75.8267	\N	2026-09-26 14:21:00.662581+05:30	pending	1	Jaipur South	95	\N	\N	\N	\N	\N
25	Harassment	Amer Fort Approach	SIH Demo Data	26.9855	75.8513	\N	2026-09-26 14:21:00.702145+05:30	pending	1	Jaipur South	88	\N	\N	\N	\N	\N
26	Misleading Service	Sindhi Camp Bus Stand	SIH Demo Data	26.9235	75.7946	\N	2026-09-26 14:21:00.703596+05:30	pending	1	Jaipur South	82	\N	\N	\N	\N	\N
27	Safety Concern	Albert Hall Museum	SIH Demo Data	26.9116	75.8195	\N	2026-09-26 14:21:00.705065+05:30	pending	1	Jaipur South	65	\N	\N	\N	\N	\N
28	Overcharging	Jal Mahal Promenade	SIH Demo Data	26.9535	75.8462	\N	2026-09-26 14:21:00.706562+05:30	pending	1	Jaipur South	55	\N	\N	\N	\N	\N
18	Overcharging or unclear bill	Lord Yash	AI Scan detected the following issues:\r\n- Handwritten informal bill lacks standard invoice requirements (date, invoice number, merchant address)\r\n- GST rate calculation is fraudulent; 200% GST is legally impossible and constitutes price gouging\r\n- Extreme pricing anomaly: GST amount exceeds the subtotal of the items purchased\r\n- Lack of professional fiscal documentation suggests potential for fraud\r\n- GST applied at 200% rate is invalid and indicative of intentional overcharging\r\n- Total bill reflects a 200% tax surcharge which is not a recognized tax bracket in any jurisdiction	28.987177197268476	77.15085243400262	["/uploads/1a328333d041ae6d77f10e8c70171e11"]	2026-09-06 13:07:20.920678+05:30	new	11	Jaipur South	88	13	\N	\N	AI_JSON: {"modifier":78,"signals":["Illegal tax rate application (200% GST)","Handwritten non-standard invoice","Extreme price gouging","Fabricated tax amount exceeding the subtotal"],"reasoning":"The merchant issued a handwritten, informal bill applying a fraudulent and legally impossible 200% GST rate, inflating the bill from 310 Rs to 930 Rs."}	1
15	Overcharging or unclear bill	unknow	AI Scan detected the following issues:\r\n- Obsolete tax structure detected (use of VAT and Service Tax instead of GST indicates a pre-2017 or fake document)\r\n- Mathematical error in Service Charge: 10% of 6770 is 677, but 676 is billed\r\n- Mathematical error in VAT 12.5%: 12.5% of 6770 is 846.25, but 801 is billed\r\n- Mathematical error in VAT 20%: 20% of 6770 is 1354, but 208 is billed\r\n- Missing GSTIN and complete business details\r\n- Internal summation error: 6770 + 676 + 801 + 208 + 368 = 8823. While the final total matches the sum of the wrong parts, the constituent tax calculations are illogical and non-compliant with standard accounting practices.\r\n- Inconsistent and arbitrary tax percentages applied\r\n- Unexplained multiple VAT tiers (12.5% and 20%)	28.987243489479123	77.15079145925108	["/uploads/9fff687fd4b1165e7d9da98d4c69b1ea"]	2026-09-06 12:21:50.461085+05:30	resolved	11	Jaipur South	85	11	1	2026-09-06 12:47:14.14638+05:30	AI_JSON: {"modifier":75,"signals":["obsolete_tax_structure","mathematical_calculation_errors","missing_gstin","illegal_tax_billing","arbitrary_taxation"],"reasoning":"The receipt demonstrates fraudulent billing practices including the illegal charging of obsolete taxes (VAT and Service Tax) and highly inconsistent, mathematically incorrect tax calculations."}	1
16	Overcharging or unclear bill	SRI KRISHNA	AI Scan detected the following issues:\r\n- Mathematical error in tax calculation: 9% of 59.00 is 5.31, but the cumulative total of 59.00 + 5.31 + 5.31 is 69.62, not 70.00.\r\n- Mathematical inconsistency: Subtotal (65) minus 10% discount (6.00) equals 59.00, which is correct, but the final sum is inconsistent.\r\n- GST implementation timing: Bill is dated 01/07/17 (the exact date GST was implemented in India), suggesting a potential manual override or legacy system confusion.\r\n- Inconsistent grand total rounding: The bill lists 69.62 (mathematically) vs 70.00 (stated).\r\n- Grand total of 70 does not align with the sum of Net Total (59) + Taxes (5.31 + 5.31 = 10.62)	28.987555300079492	77.15075097114412	["/uploads/8382904052ae25c653f12eebec50634d"]	2026-09-06 12:48:27.02375+05:30	new	11	Jaipur South	55	6	\N	\N	AI_JSON: {"modifier":15,"signals":["Minor rounding discrepancy (69.62 rounded up to 70.00)","Discount calculation discrepancy (10% of 65 calculated as 6.00)","Potential legacy system transition artifact on Day 1 of GST implementation"],"reasoning":"The receipt exhibits minor rounding and discount calculation discrepancies totaling less than 1 Rupee, likely due to legacy software configuration issues on the day of GST implementation rather than intentional tourist fraud."}	1
17	Overcharging or unclear bill	The Bikers Cafe	AI Scan detected the following issues:\r\n- Obsolete and irregular tax structure: Bill includes simultaneous charges for VAT, Service Charge, GST, CGST, and SGST, which is not a standard compliant tax practice in India.\r\n- Mathematical inconsistency: The provided VAT rate (18.9%) is non-standard and calculation (240.97) does not match 18.9% of subtotal.\r\n- Multiple tax anomalies: The sum of individual tax components (240.97 + 214.90 + 48.08 + 24.04 + 24.04 = 552.03) added to the subtotal (2149.00) equals 2701.03, which does not match the stated total of 2653.\r\n- Duplicate/Conflicting Tax Labels: Charging both flat 'GST' and broken-down 'CGST/SGST' is redundant and indicates a manipulated or non-standard billing system.\r\n- VAT rate of 18.9% is highly irregular and does not correlate with standard Indian tax slabs.\r\n- Total invoice calculation fails mathematical validation.	28.987109179957496	77.15098556531234	["/uploads/b211846b3805170a6b8a283bdcc2afc3"]	2026-09-06 13:03:19.450537+05:30	new	11	Jaipur South	10	12	\N	\N	\N	1
21	Overcharging or unclear bill	Indian Institute of Information Technology Sonepat	AI Scan detected the following issues:\r\n- The provided image is an academic class schedule (timetable), not a financial bill or invoice.\r\n- Document contains no pricing, tax information, or billing data.\r\n- Document is not a transactional record suitable for financial verification.\r\n- No prices detected as the document is an academic timetable.	\N	\N	{"/uploads/22c2097d81edec9b1a31edd9a516ce4d"}	2026-09-26 01:17:55.801307+05:30	new	11	Jaipur South	10	14	\N	\N	\N	1
19	Overcharging or unclear bill	Lord Yash	AI Scan detected the following issues:\r\n- Handwritten informal bill lacks formal business identity and GSTIN.\r\n- Invalid GST percentage: 200% GST is legally impossible in India.\r\n- Mathematical manipulation: The tax amount does not reflect standard taxation practices and is clearly fraudulent.\r\n- Lack of invoice number, date, or merchant contact details.\r\n- Tax rate of 200% is an extreme anomaly and indicator of fraudulent activity.	28.98879058262496	77.15154913073785	["/uploads/59fca81c3384782e4a16c619c98d5d7d"]	2026-09-07 09:43:16.426166+05:30	invalid	11	Jaipur South	105	13	1	2026-09-07 09:46:14.502811+05:30	AI_JSON: {"modifier":80,"signals":["Informal handwritten receipt","Absence of official business logo or GSTIN","Illegal and impossible tax rate of 200% GST","Deliberate financial manipulation to inflate the total bill"],"reasoning":"The merchant issued a handwritten receipt charging an impossible 200% GST rate, which is a clear and intentional fraudulent scam to overcharge the customer."}	1
20	Overcharging or unclear bill	The Bikers Cafe	AI Scan detected the following issues:\r\n- Inconsistent tax structure: Simultaneous use of obsolete 'VAT' and modern 'GST' components is highly irregular and suggests a fabricated tax calculation.\r\n- Mathematical error in tax calculation: VAT @ 18.9% of 2149.00 is 406.16, not 240.97. GST @ 5% of 2149.00 is 107.45, not 48.08.\r\n- Mathematical error in total sum: Sum of 2149.00 + 240.97 + 214.90 + 48.08 + 24.04 + 24.04 + 0.05 equals 2701.08, not 2653.00.\r\n- Outdated tax logic: Explicitly listing 'VAT' on a bill dated 2018 (post-GST rollout in India) is misleading and potentially fraudulent.\r\n- VAT calculation mismatch: 18.9% does not correlate with the provided amount of 240.97.\r\n- CGST/SGST calculation mismatch: 2.5% of 2149 is 53.72, not 24.04.\r\n- Total Invoice Value does not match the sum of itemized charges and taxes.	28.989586	77.15126025	["/uploads/7988ccbc810356057b810ba6b9dc5260"]	2026-09-07 11:46:25.231516+05:30	new	11	Jaipur South	25	12	\N	\N	\N	1
22	Overcharging or unclear bill	Nothing	AI Scan detected the following issues:\r\n- The provided image is not a bill or invoice; it is a digital animation/video game interface.\r\n- No commercial transaction details, merchant information, or tax breakdown found.\r\n- Input failure: The image does not contain document data suitable for fraud detection.\r\n- No prices detected.	28.987471213790858	77.15044828081707	{"/uploads/4ee7b8aba76dca32e52e7f6dbef523b9"}	2026-09-26 01:49:17.076722+05:30	new	11	Jaipur South	10	15	\N	\N	\N	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, phone, email, role, name, language, avatar_url, token_version, last_login_at, created_at, updated_at, region) FROM stdin;
123	\N	demo-tourist@yatrasetu.local	tourist	Demo Tourist	English	\N	0	\N	2026-09-06 12:07:11.302783+05:30	2026-09-06 12:07:11.302783+05:30	Jaipur
2	\N	akshatcse12511007@iiitsonepat.ac.in	inspector	Akshat	English	\N	0	\N	2026-09-02 15:26:38.688825+05:30	2026-09-02 15:26:38.688825+05:30	Jaipur North
3	\N	yashcse12511118@iiitsonepat.ac.in	inspector	Yash	English	\N	0	\N	2026-09-02 15:26:38.689607+05:30	2026-09-02 15:26:38.689607+05:30	Amer
77	999	t@t.com	tourist	T	English	\N	0	\N	2026-09-04 19:25:12.832962+05:30	2026-09-04 19:25:12.832962+05:30	\N
4	\N	devcse12511030@iiitsonepat.ac.in	inspector	Dev	English	\N	0	\N	2026-09-02 15:26:38.690129+05:30	2026-09-02 15:26:38.690129+05:30	Jaipur East
5	\N	ishantcse12511049@iiitsonepat.ac.in	inspector	Ishant	English	\N	0	\N	2026-09-02 15:26:38.690515+05:30	2026-09-02 15:26:38.690515+05:30	Jaipur West
165	+919625213877	\N	tourist	\N	English	\N	0	2026-09-26 14:16:23.491596+05:30	2026-09-26 14:16:23.491596+05:30	2026-09-26 14:16:23.491596+05:30	\N
11	+919625213875	\N	tourist	Yash	English	\N	15	2026-09-26 14:16:33.941291+05:30	2026-09-02 15:28:15.413692+05:30	2026-09-26 14:16:41.60812+05:30	\N
1	\N	mohakcse12511069@iiitsonepat.ac.in	inspector	Mohak	English	\N	10	2026-09-26 14:17:03.779118+05:30	2026-09-02 15:26:38.680023+05:30	2026-09-26 14:17:03.779118+05:30	Jaipur South
\.


--
-- Name: action_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_history_id_seq', 24, true);


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alerts_id_seq', 17, true);


--
-- Name: auth_otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_otps_id_seq', 48, true);


--
-- Name: businesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.businesses_id_seq', 15, true);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 28, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 165, true);


--
-- Name: action_history action_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_history
    ADD CONSTRAINT action_history_pkey PRIMARY KEY (id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: auth_otps auth_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_otps
    ADD CONSTRAINT auth_otps_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: guides guides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guides
    ADD CONSTRAINT guides_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_auth_otps_identifier_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_otps_identifier_active ON public.auth_otps USING btree (login_identifier, created_at DESC);


--
-- Name: idx_reports_user_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_user_created_at ON public.reports USING btree (user_id, created_at DESC);


--
-- Name: action_history action_history_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_history
    ADD CONSTRAINT action_history_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: action_history action_history_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_history
    ADD CONSTRAINT action_history_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: alerts alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reports reports_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: reports reports_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE SET NULL;


--
-- Name: reports reports_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reports reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict BMvhrFgc2exqvexqrcuGli8xV64Nh4Omda0p2gUPNlj76u9hqxsgyTgzDSzb8Me

