export interface Translation {
  // Header
  headerTitle: string
  headerSubtitle: string
  
  // Filters
  filtersTitle: string
  searchPlaceholder: string
  billType: string
  billTypeAll: string
  issueArea: string
  selectIssues: string
  filterSponsor: string
  sponsorPlaceholder: string
  filterStatus: string
  statusAll: string
  dateRange: string
  from: string
  to: string
  summarySearch: string
  summaryPlaceholder: string
  sortBy: string
  resetFilters: string
  
  // Sort options
  sortDateDesc: string
  sortDateAsc: string
  sortTitleAsc: string
  sortTitleDesc: string
  sortSponsorAsc: string
  sortSponsorDesc: string
  
  // Status options
  statusIntroduced: string
  statusCommittee: string
  statusPassed: string
  statusSigned: string
  statusVetoed: string
  
  // Bill Grid
  billsShowing: string
  billsOf: string
  billSponsor: string
  billStatus: string
  billSummary: string
  viewDetails: string
  addToFavorites: string
  removeFromFavorites: string
  pageText: string
  ofText: string
  goButton: string
  
  // Bill Modal
  closeModal: string
  latestStatus: string
  history: string
  modalSummary: string
  tags: string
  
  // Favorites
  favoritesTitle: string
  noFavorites: string
  noFavoritesMessage: string
  exportAll: string
  exportJSON: string
  
  // Stats
  totalBills: string
  activeBills: string
  favoritesBadge: string
  houseBills: string
  senateBills: string
  
  // Common
  loading: string
  noBills: string
  noBillsMessage: string
  darkMode: string
  lightMode: string
  language: string
}

export const translations: Record<'en' | 'es' | 'fr' | 'zh' | 'ja' | 'ko' | 'hi' | 'ur' | 'ar' | 'vi' | 'tl' | 'ru' | 'pt' | 'de', Translation> = {
  en: {
    // Header
    headerTitle: 'Georgia Legislation Tracker',
    headerSubtitle: 'Track and explore bills from the Georgia General Assembly',
    
    // Filters
    filtersTitle: 'Filter Bills',
    searchPlaceholder: 'Search bill numbers or titles...',
    billType: 'Bill Type',
    billTypeAll: 'All Types',
    issueArea: 'Issue Area',
    selectIssues: 'Select issues...',
    filterSponsor: 'Sponsor',
    sponsorPlaceholder: 'Filter by sponsor name...',
    filterStatus: 'Status',
    statusAll: 'All Statuses',
    dateRange: 'Date Range',
    from: 'From',
    to: 'To',
    summarySearch: 'Summary Search',
    summaryPlaceholder: 'Search within bill summaries...',
    sortBy: 'Sort By',
    resetFilters: 'Reset Filters',
    
    // Sort options
    sortDateDesc: 'Date (Newest First)',
    sortDateAsc: 'Date (Oldest First)',
    sortTitleAsc: 'Title (A-Z)',
    sortTitleDesc: 'Title (Z-A)',
    sortSponsorAsc: 'Sponsor (A-Z)',
    sortSponsorDesc: 'Sponsor (Z-A)',
    
    // Status options
    statusIntroduced: 'Introduced',
    statusCommittee: 'In Committee',
    statusPassed: 'Passed',
    statusSigned: 'Signed into Law',
    statusVetoed: 'Vetoed',
    
    // Bill Grid
    billsShowing: 'Showing',
    billsOf: 'of',
    billSponsor: 'Sponsor',
    billStatus: 'Status',
    billSummary: 'Summary',
    viewDetails: 'View Details',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    pageText: 'Page',
    ofText: 'of',
    goButton: 'Go',
    
    // Bill Modal
    closeModal: 'Close',
    latestStatus: 'Latest Status',
    history: 'History',
    modalSummary: 'Summary',
    tags: 'Tags',
    
    // Favorites
    favoritesTitle: 'Favorites',
    noFavorites: 'No favorites yet',
    noFavoritesMessage: 'Click the heart icon on any bill to add it to your favorites',
    exportAll: 'Export All',
    exportJSON: 'Export (JSON)',
    
    // Stats
    totalBills: 'Total Bills',
    activeBills: 'Active Bills',
    favoritesBadge: 'Favorites',
    houseBills: 'House Bills',
    senateBills: 'Senate Bills',
    
    // Common
    loading: 'Loading...',
    noBills: 'No bills found',
    noBillsMessage: 'Try adjusting your filters or search criteria',
    darkMode: 'Toggle dark mode',
    lightMode: 'Toggle light mode',
    language: 'Language',
  },
  
  es: {
    // Header
    headerTitle: 'Rastreador de Legislación de Georgia',
    headerSubtitle: 'Rastree y explore proyectos de ley de la Asamblea General de Georgia',
    
    // Filters
    filtersTitle: 'Filtrar Proyectos',
    searchPlaceholder: 'Buscar números o títulos de proyectos...',
    billType: 'Tipo de Proyecto',
    billTypeAll: 'Todos los Tipos',
    issueArea: 'Área de Tema',
    selectIssues: 'Seleccionar temas...',
    filterSponsor: 'Patrocinador',
    sponsorPlaceholder: 'Filtrar por nombre del patrocinador...',
    filterStatus: 'Estado',
    statusAll: 'Todos los Estados',
    dateRange: 'Rango de Fechas',
    from: 'Desde',
    to: 'Hasta',
    summarySearch: 'Búsqueda de Resumen',
    summaryPlaceholder: 'Buscar en resúmenes de proyectos...',
    sortBy: 'Ordenar Por',
    resetFilters: 'Restablecer Filtros',
    
    // Sort options
    sortDateDesc: 'Fecha (Más Reciente Primero)',
    sortDateAsc: 'Fecha (Más Antiguo Primero)',
    sortTitleAsc: 'Título (A-Z)',
    sortTitleDesc: 'Título (Z-A)',
    sortSponsorAsc: 'Patrocinador (A-Z)',
    sortSponsorDesc: 'Patrocinador (Z-A)',
    
    // Status options
    statusIntroduced: 'Presentado',
    statusCommittee: 'En Comité',
    statusPassed: 'Aprobado',
    statusSigned: 'Firmado como Ley',
    statusVetoed: 'Vetado',
    
    // Bill Grid
    billsShowing: 'Mostrando',
    billsOf: 'de',
    billSponsor: 'Patrocinador',
    billStatus: 'Estado',
    billSummary: 'Resumen',
    viewDetails: 'Ver Detalles',
    addToFavorites: 'Agregar a favoritos',
    removeFromFavorites: 'Eliminar de favoritos',
    pageText: 'Página',
    ofText: 'de',
    goButton: 'Ir',
    
    // Bill Modal
    closeModal: 'Cerrar',
    latestStatus: 'Estado Actual',
    history: 'Historial',
    modalSummary: 'Resumen',
    tags: 'Etiquetas',
    
    // Favorites
    favoritesTitle: 'Favoritos',
    noFavorites: 'No hay favoritos aún',
    noFavoritesMessage: 'Haga clic en el ícono del corazón en cualquier proyecto para agregarlo a sus favoritos',
    exportAll: 'Exportar Todo',
    exportJSON: 'Exportar (JSON)',
    
    // Stats
    totalBills: 'Total de Proyectos',
    activeBills: 'Proyectos Activos',
    favoritesBadge: 'Favoritos',
    houseBills: 'Proyectos de la Cámara',
    senateBills: 'Proyectos del Senado',
    
    // Common
    loading: 'Cargando...',
    noBills: 'No se encontraron proyectos',
    noBillsMessage: 'Intente ajustar sus filtros o criterios de búsqueda',
    darkMode: 'Alternar modo oscuro',
    lightMode: 'Alternar modo claro',
    language: 'Idioma',
  },
  
  fr: {
    // Header
    headerTitle: 'Suivi de la Législation de Géorgie',
    headerSubtitle: 'Suivez et explorez les projets de loi de l\'Assemblée générale de Géorgie',
    
    // Filters
    filtersTitle: 'Filtrer les Projets',
    searchPlaceholder: 'Rechercher des numéros ou titres de projets...',
    billType: 'Type de Projet',
    billTypeAll: 'Tous les Types',
    issueArea: 'Domaine de Sujet',
    selectIssues: 'Sélectionner des sujets...',
    filterSponsor: 'Parrain',
    sponsorPlaceholder: 'Filtrer par nom du parrain...',
    filterStatus: 'Statut',
    statusAll: 'Tous les Statuts',
    dateRange: 'Plage de Dates',
    from: 'De',
    to: 'À',
    summarySearch: 'Recherche de Résumé',
    summaryPlaceholder: 'Rechercher dans les résumés de projets...',
    sortBy: 'Trier Par',
    resetFilters: 'Réinitialiser les Filtres',
    
    // Sort options
    sortDateDesc: 'Date (Plus Récent d\'Abord)',
    sortDateAsc: 'Date (Plus Ancien d\'Abord)',
    sortTitleAsc: 'Titre (A-Z)',
    sortTitleDesc: 'Titre (Z-A)',
    sortSponsorAsc: 'Parrain (A-Z)',
    sortSponsorDesc: 'Parrain (Z-A)',
    
    // Status options
    statusIntroduced: 'Introduit',
    statusCommittee: 'En Comité',
    statusPassed: 'Adopté',
    statusSigned: 'Signé en Loi',
    statusVetoed: 'Opposé son Veto',
    
    // Bill Grid
    billsShowing: 'Affichage',
    billsOf: 'de',
    billSponsor: 'Parrain',
    billStatus: 'Statut',
    billSummary: 'Résumé',
    viewDetails: 'Voir les Détails',
    addToFavorites: 'Ajouter aux favoris',
    removeFromFavorites: 'Retirer des favoris',
    pageText: 'Page',
    ofText: 'de',
    goButton: 'Aller',
    
    // Bill Modal
    closeModal: 'Fermer',
    latestStatus: 'Statut Actuel',
    history: 'Historique',
    modalSummary: 'Résumé',
    tags: 'Étiquettes',
    
    // Favorites
    favoritesTitle: 'Favoris',
    noFavorites: 'Pas encore de favoris',
    noFavoritesMessage: 'Cliquez sur l\'icône du cœur sur n\'importe quel projet pour l\'ajouter à vos favoris',
    exportAll: 'Tout Exporter',
    exportJSON: 'Exporter (JSON)',
    
    // Stats
    totalBills: 'Total des Projets',
    activeBills: 'Projets Actifs',
    favoritesBadge: 'Favoris',
    houseBills: 'Projets de la Chambre',
    senateBills: 'Projets du Sénat',
    
    // Common
    loading: 'Chargement...',
    noBills: 'Aucun projet trouvé',
    noBillsMessage: 'Essayez d\'ajuster vos filtres ou critères de recherche',
    darkMode: 'Basculer en mode sombre',
    lightMode: 'Basculer en mode clair',
    language: 'Langue',
  },
  
  zh: {
    // Header
    headerTitle: '佐治亚州立法追踪器',
    headerSubtitle: '追踪和探索佐治亚州议会的法案',
    
    // Filters
    filtersTitle: '筛选法案',
    searchPlaceholder: '搜索法案编号或标题...',
    billType: '法案类型',
    billTypeAll: '所有类型',
    issueArea: '议题领域',
    selectIssues: '选择议题...',
    filterSponsor: '提案人',
    sponsorPlaceholder: '按提案人姓名筛选...',
    filterStatus: '状态',
    statusAll: '所有状态',
    dateRange: '日期范围',
    from: '从',
    to: '到',
    summarySearch: '摘要搜索',
    summaryPlaceholder: '在法案摘要中搜索...',
    sortBy: '排序方式',
    resetFilters: '重置筛选',
    
    // Sort options
    sortDateDesc: '日期（最新优先）',
    sortDateAsc: '日期（最旧优先）',
    sortTitleAsc: '标题（A-Z）',
    sortTitleDesc: '标题（Z-A）',
    sortSponsorAsc: '提案人（A-Z）',
    sortSponsorDesc: '提案人（Z-A）',
    
    // Status options
    statusIntroduced: '已提出',
    statusCommittee: '委员会审议中',
    statusPassed: '已通过',
    statusSigned: '已签署成为法律',
    statusVetoed: '已否决',
    
    // Bill Grid
    billsShowing: '显示',
    billsOf: '共',
    billSponsor: '提案人',
    billStatus: '状态',
    billSummary: '摘要',
    viewDetails: '查看详情',
    addToFavorites: '添加到收藏',
    removeFromFavorites: '从收藏中移除',
    pageText: '页',
    ofText: '共',
    goButton: '前往',
    
    // Bill Modal
    closeModal: '关闭',
    latestStatus: '最新状态',
    history: '历史记录',
    modalSummary: '摘要',
    tags: '标签',
    
    // Favorites
    favoritesTitle: '收藏',
    noFavorites: '暂无收藏',
    noFavoritesMessage: '点击任何法案上的心形图标将其添加到收藏',
    exportAll: '全部导出',
    exportJSON: '导出（JSON）',
    
    // Stats
    totalBills: '法案总数',
    activeBills: '活跃法案',
    favoritesBadge: '收藏',
    houseBills: '众议院法案',
    senateBills: '参议院法案',
    
    // Common
    loading: '加载中...',
    noBills: '未找到法案',
    noBillsMessage: '尝试调整您的筛选条件或搜索标准',
    darkMode: '切换暗色模式',
    lightMode: '切换亮色模式',
    language: '语言',
  },
  
  ja: {
    // Header
    headerTitle: 'ジョージア州法案追跡システム',
    headerSubtitle: 'ジョージア州議会の法案を追跡・探索',
    
    // Filters
    filtersTitle: '法案を絞り込む',
    searchPlaceholder: '法案番号またはタイトルを検索...',
    billType: '法案の種類',
    billTypeAll: 'すべての種類',
    issueArea: '問題領域',
    selectIssues: '問題を選択...',
    filterSponsor: '提案者',
    sponsorPlaceholder: '提案者名で絞り込む...',
    filterStatus: 'ステータス',
    statusAll: 'すべてのステータス',
    dateRange: '期間',
    from: '開始',
    to: '終了',
    summarySearch: '要約検索',
    summaryPlaceholder: '法案の要約内を検索...',
    sortBy: '並び替え',
    resetFilters: 'フィルタをリセット',
    
    // Sort options
    sortDateDesc: '日付（新しい順）',
    sortDateAsc: '日付（古い順）',
    sortTitleAsc: 'タイトル（A-Z）',
    sortTitleDesc: 'タイトル（Z-A）',
    sortSponsorAsc: '提案者（A-Z）',
    sortSponsorDesc: '提案者（Z-A）',
    
    // Status options
    statusIntroduced: '提出済み',
    statusCommittee: '委員会審議中',
    statusPassed: '可決',
    statusSigned: '法律として署名済み',
    statusVetoed: '拒否',
    
    // Bill Grid
    billsShowing: '表示中',
    billsOf: '件中',
    billSponsor: '提案者',
    billStatus: 'ステータス',
    billSummary: '要約',
    viewDetails: '詳細を見る',
    addToFavorites: 'お気に入りに追加',
    removeFromFavorites: 'お気に入りから削除',
    pageText: 'ページ',
    ofText: '/',
    goButton: '移動',
    
    // Bill Modal
    closeModal: '閉じる',
    latestStatus: '最新ステータス',
    history: '履歴',
    modalSummary: '要約',
    tags: 'タグ',
    
    // Favorites
    favoritesTitle: 'お気に入り',
    noFavorites: 'お気に入りはまだありません',
    noFavoritesMessage: 'ハートアイコンをクリックして法案をお気に入りに追加できます',
    exportAll: 'すべてエクスポート',
    exportJSON: 'エクスポート（JSON）',
    
    // Stats
    totalBills: '法案総数',
    activeBills: 'アクティブな法案',
    favoritesBadge: 'お気に入り',
    houseBills: '下院法案',
    senateBills: '上院法案',
    
    // Common
    loading: '読み込み中...',
    noBills: '法案が見つかりません',
    noBillsMessage: 'フィルタや検索条件を調整してください',
    darkMode: 'ダークモードに切り替え',
    lightMode: 'ライトモードに切り替え',
    language: '言語',
  },
  
  ko: {
    // Header
    headerTitle: '조지아주 법안 추적기',
    headerSubtitle: '조지아 주의회 법안 추적 및 탐색',
    
    // Filters
    filtersTitle: '법안 필터링',
    searchPlaceholder: '법안 번호 또는 제목 검색...',
    billType: '법안 유형',
    billTypeAll: '모든 유형',
    issueArea: '이슈 영역',
    selectIssues: '이슈 선택...',
    filterSponsor: '발의자',
    sponsorPlaceholder: '발의자 이름으로 필터링...',
    filterStatus: '상태',
    statusAll: '모든 상태',
    dateRange: '날짜 범위',
    from: '시작',
    to: '종료',
    summarySearch: '요약 검색',
    summaryPlaceholder: '법안 요약 내 검색...',
    sortBy: '정렬 기준',
    resetFilters: '필터 초기화',
    
    // Sort options
    sortDateDesc: '날짜 (최신순)',
    sortDateAsc: '날짜 (오래된순)',
    sortTitleAsc: '제목 (A-Z)',
    sortTitleDesc: '제목 (Z-A)',
    sortSponsorAsc: '발의자 (A-Z)',
    sortSponsorDesc: '발의자 (Z-A)',
    
    // Status options
    statusIntroduced: '발의됨',
    statusCommittee: '위원회 심사 중',
    statusPassed: '통과됨',
    statusSigned: '법률로 서명됨',
    statusVetoed: '거부됨',
    
    // Bill Grid
    billsShowing: '표시 중',
    billsOf: '중',
    billSponsor: '발의자',
    billStatus: '상태',
    billSummary: '요약',
    viewDetails: '세부 정보 보기',
    addToFavorites: '즐겨찾기에 추가',
    removeFromFavorites: '즐겨찾기에서 제거',
    pageText: '페이지',
    ofText: '/',
    goButton: '이동',
    
    // Bill Modal
    closeModal: '닫기',
    latestStatus: '최신 상태',
    history: '기록',
    modalSummary: '요약',
    tags: '태그',
    
    // Favorites
    favoritesTitle: '즐겨찾기',
    noFavorites: '아직 즐겨찾기가 없습니다',
    noFavoritesMessage: '하트 아이콘을 클릭하여 법안을 즐겨찾기에 추가하세요',
    exportAll: '모두 내보내기',
    exportJSON: '내보내기 (JSON)',
    
    // Stats
    totalBills: '총 법안 수',
    activeBills: '활성 법안',
    favoritesBadge: '즐겨찾기',
    houseBills: '하원 법안',
    senateBills: '상원 법안',
    
    // Common
    loading: '로딩 중...',
    noBills: '법안을 찾을 수 없습니다',
    noBillsMessage: '필터나 검색 조건을 조정해보세요',
    darkMode: '다크 모드 전환',
    lightMode: '라이트 모드 전환',
    language: '언어',
  },
  
  hi: {
    // Header
    headerTitle: 'जॉर्जिया विधायी ट्रैकर',
    headerSubtitle: 'जॉर्जिया महासभा के बिलों को ट्रैक और एक्सप्लोर करें',
    
    // Filters
    filtersTitle: 'बिल फ़िल्टर करें',
    searchPlaceholder: 'बिल नंबर या शीर्षक खोजें...',
    billType: 'बिल का प्रकार',
    billTypeAll: 'सभी प्रकार',
    issueArea: 'मुद्दा क्षेत्र',
    selectIssues: 'मुद्दे चुनें...',
    filterSponsor: 'प्रायोजक',
    sponsorPlaceholder: 'प्रायोजक के नाम से फ़िल्टर करें...',
    filterStatus: 'स्थिति',
    statusAll: 'सभी स्थितियां',
    dateRange: 'तिथि सीमा',
    from: 'से',
    to: 'तक',
    summarySearch: 'सारांश खोज',
    summaryPlaceholder: 'बिल सारांश में खोजें...',
    sortBy: 'इसके अनुसार क्रमबद्ध करें',
    resetFilters: 'फ़िल्टर रीसेट करें',
    
    // Sort options
    sortDateDesc: 'तिथि (नवीनतम पहले)',
    sortDateAsc: 'तिथि (पुरानी पहले)',
    sortTitleAsc: 'शीर्षक (A-Z)',
    sortTitleDesc: 'शीर्षक (Z-A)',
    sortSponsorAsc: 'प्रायोजक (A-Z)',
    sortSponsorDesc: 'प्रायोजक (Z-A)',
    
    // Status options
    statusIntroduced: 'प्रस्तुत',
    statusCommittee: 'समिति में',
    statusPassed: 'पारित',
    statusSigned: 'कानून में हस्ताक्षरित',
    statusVetoed: 'वीटो किया गया',
    
    // Bill Grid
    billsShowing: 'दिखा रहे हैं',
    billsOf: 'में से',
    billSponsor: 'प्रायोजक',
    billStatus: 'स्थिति',
    billSummary: 'सारांश',
    viewDetails: 'विवरण देखें',
    addToFavorites: 'पसंदीदा में जोड़ें',
    removeFromFavorites: 'पसंदीदा से हटाएं',
    pageText: 'पृष्ठ',
    ofText: 'का',
    goButton: 'जाएं',
    
    // Bill Modal
    closeModal: 'बंद करें',
    latestStatus: 'नवीनतम स्थिति',
    history: 'इतिहास',
    modalSummary: 'सारांश',
    tags: 'टैग',
    
    // Favorites
    favoritesTitle: 'पसंदीदा',
    noFavorites: 'अभी तक कोई पसंदीदा नहीं',
    noFavoritesMessage: 'किसी भी बिल को पसंदीदा में जोड़ने के लिए दिल आइकन पर क्लिक करें',
    exportAll: 'सभी निर्यात करें',
    exportJSON: 'निर्यात (JSON)',
    
    // Stats
    totalBills: 'कुल बिल',
    activeBills: 'सक्रिय बिल',
    favoritesBadge: 'पसंदीदा',
    houseBills: 'लोकसभा बिल',
    senateBills: 'सीनेट बिल',
    
    // Common
    loading: 'लोड हो रहा है...',
    noBills: 'कोई बिल नहीं मिला',
    noBillsMessage: 'अपने फ़िल्टर या खोज मानदंड को समायोजित करने का प्रयास करें',
    darkMode: 'डार्क मोड टॉगल करें',
    lightMode: 'लाइट मोड टॉगल करें',
    language: 'भाषा',
  },
  
  ur: {
    // Header
    headerTitle: 'جارجیا قانون سازی ٹریکر',
    headerSubtitle: 'جارجیا جنرل اسمبلی کے بلوں کو ٹریک اور دریافت کریں',
    
    // Filters
    filtersTitle: 'بل فلٹر کریں',
    searchPlaceholder: 'بل نمبر یا عنوان تلاش کریں...',
    billType: 'بل کی قسم',
    billTypeAll: 'تمام اقسام',
    issueArea: 'مسئلہ کا علاقہ',
    selectIssues: 'مسائل منتخب کریں...',
    filterSponsor: 'سپانسر',
    sponsorPlaceholder: 'سپانسر کے نام سے فلٹر کریں...',
    filterStatus: 'حیثیت',
    statusAll: 'تمام حیثیتیں',
    dateRange: 'تاریخ کی حد',
    from: 'سے',
    to: 'تک',
    summarySearch: 'خلاصہ تلاش',
    summaryPlaceholder: 'بل کے خلاصے میں تلاش کریں...',
    sortBy: 'ترتیب دیں',
    resetFilters: 'فلٹرز دوبارہ ترتیب دیں',
    
    // Sort options
    sortDateDesc: 'تاریخ (تازہ ترین پہلے)',
    sortDateAsc: 'تاریخ (پرانے پہلے)',
    sortTitleAsc: 'عنوان (A-Z)',
    sortTitleDesc: 'عنوان (Z-A)',
    sortSponsorAsc: 'سپانسر (A-Z)',
    sortSponsorDesc: 'سپانسر (Z-A)',
    
    // Status options
    statusIntroduced: 'متعارف کرایا گیا',
    statusCommittee: 'کمیٹی میں',
    statusPassed: 'منظور',
    statusSigned: 'قانون میں دستخط شدہ',
    statusVetoed: 'ویٹو کیا گیا',
    
    // Bill Grid
    billsShowing: 'دکھا رہے ہیں',
    billsOf: 'میں سے',
    billSponsor: 'سپانسر',
    billStatus: 'حیثیت',
    billSummary: 'خلاصہ',
    viewDetails: 'تفصیلات دیکھیں',
    addToFavorites: 'پسندیدہ میں شامل کریں',
    removeFromFavorites: 'پسندیدہ سے ہٹائیں',
    pageText: 'صفحہ',
    ofText: 'کا',
    goButton: 'جائیں',
    
    // Bill Modal
    closeModal: 'بند کریں',
    latestStatus: 'تازہ ترین حیثیت',
    history: 'تاریخ',
    modalSummary: 'خلاصہ',
    tags: 'ٹیگز',
    
    // Favorites
    favoritesTitle: 'پسندیدہ',
    noFavorites: 'ابھی تک کوئی پسندیدہ نہیں',
    noFavoritesMessage: 'کسی بھی بل کو پسندیدہ میں شامل کرنے کے لیے دل کے آئیکن پر کلک کریں',
    exportAll: 'تمام برآمد کریں',
    exportJSON: 'برآمد (JSON)',
    
    // Stats
    totalBills: 'کل بل',
    activeBills: 'فعال بل',
    favoritesBadge: 'پسندیدہ',
    houseBills: 'ایوان کے بل',
    senateBills: 'سینیٹ کے بل',
    
    // Common
    loading: 'لوڈ ہو رہا ہے...',
    noBills: 'کوئی بل نہیں ملا',
    noBillsMessage: 'اپنے فلٹرز یا تلاش کے معیار کو ایڈجسٹ کرنے کی کوشش کریں',
    darkMode: 'ڈارک موڈ ٹوگل کریں',
    lightMode: 'لائٹ موڈ ٹوگل کریں',
    language: 'زبان',
  },
  
  ar: {
    // Header
    headerTitle: 'متتبع تشريعات جورجيا',
    headerSubtitle: 'تتبع واستكشاف مشاريع القوانين من الجمعية العامة لجورجيا',
    
    // Filters
    filtersTitle: 'تصفية مشاريع القوانين',
    searchPlaceholder: 'البحث عن أرقام أو عناوين مشاريع القوانين...',
    billType: 'نوع مشروع القانون',
    billTypeAll: 'كل الأنواع',
    issueArea: 'مجال القضية',
    selectIssues: 'اختر القضايا...',
    filterSponsor: 'الراعي',
    sponsorPlaceholder: 'تصفية حسب اسم الراعي...',
    filterStatus: 'الحالة',
    statusAll: 'كل الحالات',
    dateRange: 'نطاق التاريخ',
    from: 'من',
    to: 'إلى',
    summarySearch: 'بحث الملخص',
    summaryPlaceholder: 'البحث في ملخصات مشاريع القوانين...',
    sortBy: 'ترتيب حسب',
    resetFilters: 'إعادة تعيين المرشحات',
    
    // Sort options
    sortDateDesc: 'التاريخ (الأحدث أولاً)',
    sortDateAsc: 'التاريخ (الأقدم أولاً)',
    sortTitleAsc: 'العنوان (أ-ي)',
    sortTitleDesc: 'العنوان (ي-أ)',
    sortSponsorAsc: 'الراعي (أ-ي)',
    sortSponsorDesc: 'الراعي (ي-أ)',
    
    // Status options
    statusIntroduced: 'مقدم',
    statusCommittee: 'في اللجنة',
    statusPassed: 'تم التمرير',
    statusSigned: 'موقع كقانون',
    statusVetoed: 'تم الاعتراض',
    
    // Bill Grid
    billsShowing: 'عرض',
    billsOf: 'من',
    billSponsor: 'الراعي',
    billStatus: 'الحالة',
    billSummary: 'الملخص',
    viewDetails: 'عرض التفاصيل',
    addToFavorites: 'إضافة إلى المفضلة',
    removeFromFavorites: 'إزالة من المفضلة',
    pageText: 'صفحة',
    ofText: 'من',
    goButton: 'انتقال',
    
    // Bill Modal
    closeModal: 'إغلاق',
    latestStatus: 'أحدث حالة',
    history: 'التاريخ',
    modalSummary: 'الملخص',
    tags: 'الوسوم',
    
    // Favorites
    favoritesTitle: 'المفضلة',
    noFavorites: 'لا توجد مفضلة بعد',
    noFavoritesMessage: 'انقر على رمز القلب في أي مشروع قانون لإضافته إلى المفضلة',
    exportAll: 'تصدير الكل',
    exportJSON: 'تصدير (JSON)',
    
    // Stats
    totalBills: 'إجمالي مشاريع القوانين',
    activeBills: 'مشاريع القوانين النشطة',
    favoritesBadge: 'المفضلة',
    houseBills: 'مشاريع قوانين مجلس النواب',
    senateBills: 'مشاريع قوانين مجلس الشيوخ',
    
    // Common
    loading: 'جاري التحميل...',
    noBills: 'لم يتم العثور على مشاريع قوانين',
    noBillsMessage: 'حاول تعديل المرشحات أو معايير البحث',
    darkMode: 'تبديل الوضع الداكن',
    lightMode: 'تبديل الوضع الفاتح',
    language: 'اللغة',
  },
  
  vi: {
    // Header
    headerTitle: 'Theo Dõi Luật Georgia',
    headerSubtitle: 'Theo dõi và khám phá các dự luật từ Đại hội đồng Georgia',
    
    // Filters
    filtersTitle: 'Lọc Dự Luật',
    searchPlaceholder: 'Tìm kiếm số hoặc tiêu đề dự luật...',
    billType: 'Loại Dự Luật',
    billTypeAll: 'Tất Cả Loại',
    issueArea: 'Lĩnh Vực Vấn Đề',
    selectIssues: 'Chọn vấn đề...',
    filterSponsor: 'Nhà Tài Trợ',
    sponsorPlaceholder: 'Lọc theo tên nhà tài trợ...',
    filterStatus: 'Trạng Thái',
    statusAll: 'Tất Cả Trạng Thái',
    dateRange: 'Khoảng Thời Gian',
    from: 'Từ',
    to: 'Đến',
    summarySearch: 'Tìm Kiếm Tóm Tắt',
    summaryPlaceholder: 'Tìm trong tóm tắt dự luật...',
    sortBy: 'Sắp Xếp Theo',
    resetFilters: 'Đặt Lại Bộ Lọc',
    
    // Sort options
    sortDateDesc: 'Ngày (Mới Nhất Trước)',
    sortDateAsc: 'Ngày (Cũ Nhất Trước)',
    sortTitleAsc: 'Tiêu Đề (A-Z)',
    sortTitleDesc: 'Tiêu Đề (Z-A)',
    sortSponsorAsc: 'Nhà Tài Trợ (A-Z)',
    sortSponsorDesc: 'Nhà Tài Trợ (Z-A)',
    
    // Status options
    statusIntroduced: 'Đã Giới Thiệu',
    statusCommittee: 'Trong Ủy Ban',
    statusPassed: 'Đã Thông Qua',
    statusSigned: 'Đã Ký Thành Luật',
    statusVetoed: 'Đã Phủ Quyết',
    
    // Bill Grid
    billsShowing: 'Hiển Thị',
    billsOf: 'của',
    billSponsor: 'Nhà Tài Trợ',
    billStatus: 'Trạng Thái',
    billSummary: 'Tóm Tắt',
    viewDetails: 'Xem Chi Tiết',
    addToFavorites: 'Thêm vào yêu thích',
    removeFromFavorites: 'Xóa khỏi yêu thích',
    pageText: 'Trang',
    ofText: 'của',
    goButton: 'Đi',
    
    // Bill Modal
    closeModal: 'Đóng',
    latestStatus: 'Trạng Thái Mới Nhất',
    history: 'Lịch Sử',
    modalSummary: 'Tóm Tắt',
    tags: 'Thẻ',
    
    // Favorites
    favoritesTitle: 'Yêu Thích',
    noFavorites: 'Chưa có yêu thích',
    noFavoritesMessage: 'Nhấp vào biểu tượng trái tim trên bất kỳ dự luật nào để thêm vào yêu thích',
    exportAll: 'Xuất Tất Cả',
    exportJSON: 'Xuất (JSON)',
    
    // Stats
    totalBills: 'Tổng Số Dự Luật',
    activeBills: 'Dự Luật Đang Hoạt Động',
    favoritesBadge: 'Yêu Thích',
    houseBills: 'Dự Luật Hạ Viện',
    senateBills: 'Dự Luật Thượng Viện',
    
    // Common
    loading: 'Đang tải...',
    noBills: 'Không tìm thấy dự luật',
    noBillsMessage: 'Thử điều chỉnh bộ lọc hoặc tiêu chí tìm kiếm của bạn',
    darkMode: 'Chuyển chế độ tối',
    lightMode: 'Chuyển chế độ sáng',
    language: 'Ngôn Ngữ',
  },
  
  tl: {
    // Header
    headerTitle: 'Georgia Legislation Tracker',
    headerSubtitle: 'Subaybayan at tuklasin ang mga panukalang batas mula sa Georgia General Assembly',
    
    // Filters
    filtersTitle: 'I-filter ang mga Panukalang Batas',
    searchPlaceholder: 'Maghanap ng numero o pamagat ng panukalang batas...',
    billType: 'Uri ng Panukalang Batas',
    billTypeAll: 'Lahat ng Uri',
    issueArea: 'Lugar ng Isyu',
    selectIssues: 'Pumili ng mga isyu...',
    filterSponsor: 'Sponsor',
    sponsorPlaceholder: 'I-filter ayon sa pangalan ng sponsor...',
    filterStatus: 'Katayuan',
    statusAll: 'Lahat ng Katayuan',
    dateRange: 'Saklaw ng Petsa',
    from: 'Mula',
    to: 'Hanggang',
    summarySearch: 'Paghahanap sa Buod',
    summaryPlaceholder: 'Maghanap sa loob ng mga buod ng panukalang batas...',
    sortBy: 'Ayusin Ayon sa',
    resetFilters: 'I-reset ang mga Filter',
    
    // Sort options
    sortDateDesc: 'Petsa (Pinakabago Una)',
    sortDateAsc: 'Petsa (Pinakadati Una)',
    sortTitleAsc: 'Pamagat (A-Z)',
    sortTitleDesc: 'Pamagat (Z-A)',
    sortSponsorAsc: 'Sponsor (A-Z)',
    sortSponsorDesc: 'Sponsor (Z-A)',
    
    // Status options
    statusIntroduced: 'Ipinakilala',
    statusCommittee: 'Sa Komite',
    statusPassed: 'Naipasa',
    statusSigned: 'Nilagdaan Bilang Batas',
    statusVetoed: 'Na-veto',
    
    // Bill Grid
    billsShowing: 'Ipinapakita',
    billsOf: 'ng',
    billSponsor: 'Sponsor',
    billStatus: 'Katayuan',
    billSummary: 'Buod',
    viewDetails: 'Tingnan ang Detalye',
    addToFavorites: 'Idagdag sa mga paborito',
    removeFromFavorites: 'Alisin sa mga paborito',
    pageText: 'Pahina',
    ofText: 'ng',
    goButton: 'Pumunta',
    
    // Bill Modal
    closeModal: 'Isara',
    latestStatus: 'Pinakabagong Katayuan',
    history: 'Kasaysayan',
    modalSummary: 'Buod',
    tags: 'Mga Tag',
    
    // Favorites
    favoritesTitle: 'Mga Paborito',
    noFavorites: 'Walang mga paborito pa',
    noFavoritesMessage: 'I-click ang icon ng puso sa anumang panukalang batas upang idagdag ito sa iyong mga paborito',
    exportAll: 'I-export Lahat',
    exportJSON: 'I-export (JSON)',
    
    // Stats
    totalBills: 'Kabuuang Panukalang Batas',
    activeBills: 'Aktibong Panukalang Batas',
    favoritesBadge: 'Mga Paborito',
    houseBills: 'Panukalang Batas ng Kapulungan',
    senateBills: 'Panukalang Batas ng Senado',
    
    // Common
    loading: 'Naglo-load...',
    noBills: 'Walang nahanap na panukalang batas',
    noBillsMessage: 'Subukang ayusin ang iyong mga filter o pamantayan sa paghahanap',
    darkMode: 'I-toggle ang dark mode',
    lightMode: 'I-toggle ang light mode',
    language: 'Wika',
  },
  
  ru: {
    // Header
    headerTitle: 'Трекер законодательства Джорджии',
    headerSubtitle: 'Отслеживайте и изучайте законопроекты Генеральной Ассамблеи Джорджии',
    
    // Filters
    filtersTitle: 'Фильтр законопроектов',
    searchPlaceholder: 'Поиск по номеру или названию законопроекта...',
    billType: 'Тип законопроекта',
    billTypeAll: 'Все типы',
    issueArea: 'Область проблемы',
    selectIssues: 'Выбрать проблемы...',
    filterSponsor: 'Спонсор',
    sponsorPlaceholder: 'Фильтр по имени спонсора...',
    filterStatus: 'Статус',
    statusAll: 'Все статусы',
    dateRange: 'Диапазон дат',
    from: 'С',
    to: 'По',
    summarySearch: 'Поиск по резюме',
    summaryPlaceholder: 'Поиск в резюме законопроектов...',
    sortBy: 'Сортировать по',
    resetFilters: 'Сбросить фильтры',
    
    // Sort options
    sortDateDesc: 'Дата (сначала новые)',
    sortDateAsc: 'Дата (сначала старые)',
    sortTitleAsc: 'Название (А-Я)',
    sortTitleDesc: 'Название (Я-А)',
    sortSponsorAsc: 'Спонсор (А-Я)',
    sortSponsorDesc: 'Спонсор (Я-А)',
    
    // Status options
    statusIntroduced: 'Внесён',
    statusCommittee: 'В комитете',
    statusPassed: 'Принят',
    statusSigned: 'Подписан как закон',
    statusVetoed: 'Наложено вето',
    
    // Bill Grid
    billsShowing: 'Показано',
    billsOf: 'из',
    billSponsor: 'Спонсор',
    billStatus: 'Статус',
    billSummary: 'Резюме',
    viewDetails: 'Показать детали',
    addToFavorites: 'Добавить в избранное',
    removeFromFavorites: 'Удалить из избранного',
    pageText: 'Страница',
    ofText: 'из',
    goButton: 'Перейти',
    
    // Bill Modal
    closeModal: 'Закрыть',
    latestStatus: 'Последний статус',
    history: 'История',
    modalSummary: 'Резюме',
    tags: 'Теги',
    
    // Favorites
    favoritesTitle: 'Избранное',
    noFavorites: 'Пока нет избранного',
    noFavoritesMessage: 'Нажмите на значок сердца на любом законопроекте, чтобы добавить его в избранное',
    exportAll: 'Экспортировать всё',
    exportJSON: 'Экспорт (JSON)',
    
    // Stats
    totalBills: 'Всего законопроектов',
    activeBills: 'Активные законопроекты',
    favoritesBadge: 'Избранное',
    houseBills: 'Законопроекты Палаты представителей',
    senateBills: 'Законопроекты Сената',
    
    // Common
    loading: 'Загрузка...',
    noBills: 'Законопроекты не найдены',
    noBillsMessage: 'Попробуйте изменить фильтры или критерии поиска',
    darkMode: 'Переключить тёмный режим',
    lightMode: 'Переключить светлый режим',
    language: 'Язык',
  },
  
  pt: {
    // Header
    headerTitle: 'Rastreador de Legislação da Geórgia',
    headerSubtitle: 'Rastreie e explore projetos de lei da Assembleia Geral da Geórgia',
    
    // Filters
    filtersTitle: 'Filtrar Projetos',
    searchPlaceholder: 'Pesquisar números ou títulos de projetos...',
    billType: 'Tipo de Projeto',
    billTypeAll: 'Todos os Tipos',
    issueArea: 'Área de Problema',
    selectIssues: 'Selecionar problemas...',
    filterSponsor: 'Patrocinador',
    sponsorPlaceholder: 'Filtrar por nome do patrocinador...',
    filterStatus: 'Status',
    statusAll: 'Todos os Status',
    dateRange: 'Intervalo de Datas',
    from: 'De',
    to: 'Até',
    summarySearch: 'Pesquisa de Resumo',
    summaryPlaceholder: 'Pesquisar em resumos de projetos...',
    sortBy: 'Ordenar Por',
    resetFilters: 'Redefinir Filtros',
    
    // Sort options
    sortDateDesc: 'Data (Mais Recente Primeiro)',
    sortDateAsc: 'Data (Mais Antigo Primeiro)',
    sortTitleAsc: 'Título (A-Z)',
    sortTitleDesc: 'Título (Z-A)',
    sortSponsorAsc: 'Patrocinador (A-Z)',
    sortSponsorDesc: 'Patrocinador (Z-A)',
    
    // Status options
    statusIntroduced: 'Apresentado',
    statusCommittee: 'Em Comitê',
    statusPassed: 'Aprovado',
    statusSigned: 'Assinado como Lei',
    statusVetoed: 'Vetado',
    
    // Bill Grid
    billsShowing: 'Mostrando',
    billsOf: 'de',
    billSponsor: 'Patrocinador',
    billStatus: 'Status',
    billSummary: 'Resumo',
    viewDetails: 'Ver Detalhes',
    addToFavorites: 'Adicionar aos favoritos',
    removeFromFavorites: 'Remover dos favoritos',
    pageText: 'Página',
    ofText: 'de',
    goButton: 'Ir',
    
    // Bill Modal
    closeModal: 'Fechar',
    latestStatus: 'Status Mais Recente',
    history: 'Histórico',
    modalSummary: 'Resumo',
    tags: 'Etiquetas',
    
    // Favorites
    favoritesTitle: 'Favoritos',
    noFavorites: 'Ainda não há favoritos',
    noFavoritesMessage: 'Clique no ícone do coração em qualquer projeto para adicioná-lo aos seus favoritos',
    exportAll: 'Exportar Tudo',
    exportJSON: 'Exportar (JSON)',
    
    // Stats
    totalBills: 'Total de Projetos',
    activeBills: 'Projetos Ativos',
    favoritesBadge: 'Favoritos',
    houseBills: 'Projetos da Câmara',
    senateBills: 'Projetos do Senado',
    
    // Common
    loading: 'Carregando...',
    noBills: 'Nenhum projeto encontrado',
    noBillsMessage: 'Tente ajustar seus filtros ou critérios de pesquisa',
    darkMode: 'Alternar modo escuro',
    lightMode: 'Alternar modo claro',
    language: 'Idioma',
  },
  
  de: {
    // Header
    headerTitle: 'Georgia Gesetzgebungs-Tracker',
    headerSubtitle: 'Verfolgen und erkunden Sie Gesetzesentwürfe der Generalversammlung von Georgia',
    
    // Filters
    filtersTitle: 'Gesetzesentwürfe filtern',
    searchPlaceholder: 'Gesetznummer oder Titel suchen...',
    billType: 'Gesetzestyp',
    billTypeAll: 'Alle Typen',
    issueArea: 'Themenbereich',
    selectIssues: 'Themen auswählen...',
    filterSponsor: 'Sponsor',
    sponsorPlaceholder: 'Nach Sponsor-Namen filtern...',
    filterStatus: 'Status',
    statusAll: 'Alle Status',
    dateRange: 'Datumsbereich',
    from: 'Von',
    to: 'Bis',
    summarySearch: 'Zusammenfassungssuche',
    summaryPlaceholder: 'In Gesetzesentwürfen suchen...',
    sortBy: 'Sortieren nach',
    resetFilters: 'Filter zurücksetzen',
    
    // Sort options
    sortDateDesc: 'Datum (Neueste zuerst)',
    sortDateAsc: 'Datum (Älteste zuerst)',
    sortTitleAsc: 'Titel (A-Z)',
    sortTitleDesc: 'Titel (Z-A)',
    sortSponsorAsc: 'Sponsor (A-Z)',
    sortSponsorDesc: 'Sponsor (Z-A)',
    
    // Status options
    statusIntroduced: 'Eingebracht',
    statusCommittee: 'Im Ausschuss',
    statusPassed: 'Verabschiedet',
    statusSigned: 'Als Gesetz unterzeichnet',
    statusVetoed: 'Veto eingelegt',
    
    // Bill Grid
    billsShowing: 'Zeige',
    billsOf: 'von',
    billSponsor: 'Sponsor',
    billStatus: 'Status',
    billSummary: 'Zusammenfassung',
    viewDetails: 'Details anzeigen',
    addToFavorites: 'Zu Favoriten hinzufügen',
    removeFromFavorites: 'Aus Favoriten entfernen',
    pageText: 'Seite',
    ofText: 'von',
    goButton: 'Los',
    
    // Bill Modal
    closeModal: 'Schließen',
    latestStatus: 'Neuester Status',
    history: 'Verlauf',
    modalSummary: 'Zusammenfassung',
    tags: 'Tags',
    
    // Favorites
    favoritesTitle: 'Favoriten',
    noFavorites: 'Noch keine Favoriten',
    noFavoritesMessage: 'Klicken Sie auf das Herzsymbol bei einem Gesetzesentwurf, um ihn zu Ihren Favoriten hinzuzufügen',
    exportAll: 'Alle exportieren',
    exportJSON: 'Exportieren (JSON)',
    
    // Stats
    totalBills: 'Gesamtzahl der Gesetzesentwürfe',
    activeBills: 'Aktive Gesetzesentwürfe',
    favoritesBadge: 'Favoriten',
    houseBills: 'Gesetzesentwürfe des Repräsentantenhauses',
    senateBills: 'Gesetzesentwürfe des Senats',
    
    // Common
    loading: 'Wird geladen...',
    noBills: 'Keine Gesetzesentwürfe gefunden',
    noBillsMessage: 'Versuchen Sie, Ihre Filter oder Suchkriterien anzupassen',
    darkMode: 'Dunkelmodus umschalten',
    lightMode: 'Hellmodus umschalten',
    language: 'Sprache',
  },
}

export type Language = keyof typeof translations
