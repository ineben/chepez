const {restoreCase, pluralize} = require("../PluralizeEs");
const articleze = require("../Articleze");
const {getWords} = require("./wordFinder");
const stringSimilarity = require('string-similarity');
const lorca = require('lorca-nlp');

const rules = [
	[/(?:[\s.,!?])(llendo)(?:[\s.,!?]|$)/gi, " yendo "],
	[/(?:[\s.,!?])(la mayoria de personas)(?:[\s.,!?]|$)/gi, " la mayoría de las personas "],
	[/(?:[\s.,!?])(camisa a rayas)(?:[\s.,!?]|$)/gi, " camisa de rayas "],
	[/(?:[\s.,!?])(han habido)(?:[\s.,!?]|$)/gi, " ha habido "],
	[/(?:[\s.,!?])(pienso de que)(?:[\s.,!?]|$)/gi, " pienso que "],
	[/(?:[\s.,!?])(en base a)(?:[\s.,!?]|$)/gi, " con base en "],
	[/(?:[\s.,!?])(a dentro)(?:[\s.,!?]|$)/gi, " adentro "],
	[/(?:[\s.,!?])(a fuera)(?:[\s.,!?]|$)/gi, " afuera "],
	[/(?:[\s.,!?])(apesar)(?:[\s.,!?]|$)/gi, " a pesar "],
	[/(?:[\s.,!?])(osea)(?:[\s.,!?]|$)/gi, " o sea "],
	[/(?:[\s.,!?])(ósea)(?:[\s.,!?]|$)/gi, " o sea "],
	[/(?:[\s.,!?])(ó sea)(?:[\s.,!?]|$)/gi, " o sea "],
	[/(?:[\s.,!?])(A travez)(?:[\s.,!?]|$)/gi, " a través "],
	[/(?:[\s.,!?])(através)(?:[\s.,!?]|$)/gi, " a través "],
	[/(?:[\s.,!?])(atravez)(?:[\s.,!?]|$)/gi, " a través "],
	[/(?:[\s.,!?])(detras mio)(?:[\s.,!?]|$)/gi, " detrás de mí "],
	[/(?:[\s.,!?])(foliar)(?:[\s.,!?]|$)/gi, " folear "],
	[/(?:[\s.,!?])(prever)(?:[\s.,!?]|$)/gi, " preveer "],
	[/(?:[\s.,!?])(previó)(?:[\s.,!?]|$)/gi, " preevió "],
];

const abbr = [
	[/(?:[\s.,!?])(aa vv)(?:[\s.,!?]|$)/gi, " autores varios "],
	[/(?:[\s.,!?])(Abg)(?:[\s.,!?]|$)/gi, " abogado "],
	[/(?:[\s.,!?])(Abg)(?:[\s.,!?]|$)/gi, " abogada "],
	[/(?:[\s.,!?])(acept)(?:[\s.,!?]|$)/gi, " aceptación "],
	[/(?:[\s.,!?])(A D)(?:[\s.,!?]|$)/gi, " anno Dómini "],
	[/(?:[\s.,!?])(a de C)(?:[\s.,!?]|$)/gi, " antes de Cristo "],
	[/(?:[\s.,!?])(a de J C)(?:[\s.,!?]|$)/gi, " antes de Jesucristo "],
	[/(?:[\s.,!?])(adg)(?:[\s.,!?]|$)/gi, " a Dios gracias "],
	[/(?:[\s.,!?])(admón)(?:[\s.,!?]|$)/gi, " administración "],
	[/(?:[\s.,!?])(adm)(?:[\s.,!?]|$)/gi, " administrador "],
	[/(?:[\s.,!?])(adm)(?:[\s.,!?]|$)/gi, " administradora "],
	[/(?:[\s.,!?])(afmo)(?:[\s.,!?]|$)/gi, " afectísimo "],
	[/(?:[\s.,!?])(A I)(?:[\s.,!?]|$)/gi, " alteza imperial "],
	[/(?:[\s.,!?])(a J C)(?:[\s.,!?]|$)/gi, " antes de Jesucristo "],
	[/(?:[\s.,!?])(Alfz)(?:[\s.,!?]|$)/gi, " alférez "],
	[/(?:[\s.,!?])(Almte)(?:[\s.,!?]|$)/gi, " almirante "],
	[/(?:[\s.,!?])(a m)(?:[\s.,!?]|$)/gi, " ante merídiem "],
	[/(?:[\s.,!?])(am)(?:[\s.,!?]|$)/gi, " a m "],
	[/(?:[\s.,!?])(A M D G)(?:[\s.,!?]|$)/gi, " ad maiórem Dei glóriam "],
	[/(?:[\s.,!?])(ap)(?:[\s.,!?]|$)/gi, " aparte "],
	[/(?:[\s.,!?])(apdo)(?:[\s.,!?]|$)/gi, " apartado "],
	[/(?:[\s.,!?])(A R)(?:[\s.,!?]|$)/gi, " alteza real "],
	[/(?:[\s.,!?])(Arq)(?:[\s.,!?]|$)/gi, " arquitecto "],
	[/(?:[\s.,!?])(Arq)(?:[\s.,!?]|$)/gi, " arquitecta "],
	[/(?:[\s.,!?])(art)(?:[\s.,!?]|$)/gi, " artículo "],
	[/(?:[\s.,!?])(Arz)(?:[\s.,!?]|$)/gi, " arzobispo "],
	[/(?:[\s.,!?])(atte)(?:[\s.,!?]|$)/gi, " atentamente "],
	[/(?:[\s.,!?])(atto)(?:[\s.,!?]|$)/gi, " atento "],
	[/(?:[\s.,!?])(av)(?:[\s.,!?]|$)/gi, " avenida "],
	[/(?:[\s.,!?])(B)(?:[\s.,!?]|$)/gi, " beato "],
	[/(?:[\s.,!?])(B)(?:[\s.,!?]|$)/gi, " beata "],
	[/(?:[\s.,!?])(Bto)(?:[\s.,!?]|$)/gi, " beato "],
	[/(?:[\s.,!?])(Bta)(?:[\s.,!?]|$)/gi, " beata "],
	[/(?:[\s.,!?])(Rta)(?:[\s.,!?]|$)/gi, " respuesta "],
	[/(?:[\s.,!?])(Barna)(?:[\s.,!?]|$)/gi, " Barcelona "],
	[/(?:[\s.,!?])(Bco)(?:[\s.,!?]|$)/gi, " banco "],
	[/(?:[\s.,!?])(Bibl)(?:[\s.,!?]|$)/gi, " biblioteca "],
	[/(?:[\s.,!?])(Bo)(?:[\s.,!?]|$)/gi, " barrio "],
	[/(?:[\s.,!?])(Brig)(?:[\s.,!?]|$)/gi, " brigada "],
	[/(?:[\s.,!?])(Bs As)(?:[\s.,!?]|$)/gi, " Buenos Aires "],
	[/(?:[\s.,!?])(c)(?:[\s.,!?]|$)/gi, " calle "],
	[/(?:[\s.,!?])(c)(?:[\s.,!?]|$)/gi, " capítulo "],
	[/(?:[\s.,!?])(Cía)(?:[\s.,!?]|$)/gi, " compañía "],
	[/(?:[\s.,!?])(cap)(?:[\s.,!?]|$)/gi, " capítulo "],
	[/(?:[\s.,!?])(Cap)(?:[\s.,!?]|$)/gi, " capitán "],
	[/(?:[\s.,!?])(Cap)(?:[\s.,!?]|$)/gi, " capital "],
	[/(?:[\s.,!?])(Cap Fed)(?:[\s.,!?]|$)/gi, " Capital Federal "],
	[/(?:[\s.,!?])(CF)(?:[\s.,!?]|$)/gi, " Capital Federal "],
	[/(?:[\s.,!?])(cap)(?:[\s.,!?]|$)/gi, " capítulo "],
	[/(?:[\s.,!?])(c c)(?:[\s.,!?]|$)/gi, " cédula de ciudadanía "],
	[/(?:[\s.,!?])(C C)(?:[\s.,!?]|$)/gi, " casilla de correo "],
	[/(?:[\s.,!?])(cta cte)(?:[\s.,!?]|$)/gi, " cuenta corriente "],
	[/(?:[\s.,!?])(Cdad)(?:[\s.,!?]|$)/gi, " ciudad "],
	[/(?:[\s.,!?])(c e)(?:[\s.,!?]|$)/gi, " correo electrónico "],
	[/(?:[\s.,!?])(cent)(?:[\s.,!?]|$)/gi, " centavo "],
	[/(?:[\s.,!?])(ctvo)(?:[\s.,!?]|$)/gi, " centavo "],
	[/(?:[\s.,!?])(cent)(?:[\s.,!?]|$)/gi, "  centésimo "],
	[/(?:[\s.,!?])(C F)(?:[\s.,!?]|$)/gi, " Capital Federal "],
	[/(?:[\s.,!?])(cgo)(?:[\s.,!?]|$)/gi, " cargo "],
	[/(?:[\s.,!?])(C I)(?:[\s.,!?]|$)/gi, " cédula de identidad "],
	[/(?:[\s.,!?])(cje)(?:[\s.,!?]|$)/gi, " corretaje "],
	[/(?:[\s.,!?])(cl)(?:[\s.,!?]|$)/gi, " calle "],
	[/(?:[\s.,!?])(Cmdt)(?:[\s.,!?]|$)/gi, " comandante "],
	[/(?:[\s.,!?])(Comte)(?:[\s.,!?]|$)/gi, " comandate "],
	[/(?:[\s.,!?])(Cte)(?:[\s.,!?]|$)/gi, " comandate "],
	[/(?:[\s.,!?])(Cnel)(?:[\s.,!?]|$)/gi, " coronel "],
	[/(?:[\s.,!?])(Col)(?:[\s.,!?]|$)/gi, " coronel "],
	[/(?:[\s.,!?])(cód)(?:[\s.,!?]|$)/gi, " código "],
	[/(?:[\s.,!?])(col)(?:[\s.,!?]|$)/gi, " colección "],
	[/(?:[\s.,!?])(Col)(?:[\s.,!?]|$)/gi, " colegio "],
	[/(?:[\s.,!?])(Comod)(?:[\s.,!?]|$)/gi, " comodoro "],
	[/(?:[\s.,!?])(com)(?:[\s.,!?]|$)/gi, " comisión "],
	[/(?:[\s.,!?])(Comp)(?:[\s.,!?]|$)/gi, " compañía "],
	[/(?:[\s.,!?])(Comte)(?:[\s.,!?]|$)/gi, " comandante "],
	[/(?:[\s.,!?])(cónf)(?:[\s.,!?]|$)/gi, " cónfer "],
	[/(?:[\s.,!?])(cónfr)(?:[\s.,!?]|$)/gi, " cónfer "],
	[/(?:[\s.,!?])(Contralmte)(?:[\s.,!?]|$)/gi, " contralmirante "],
	[/(?:[\s.,!?])(coord)(?:[\s.,!?]|$)/gi, " coordinador "],
	[/(?:[\s.,!?])(coord)(?:[\s.,!?]|$)/gi, " coordinadora "],
	[/(?:[\s.,!?])(cp)(?:[\s.,!?]|$)/gi, " compárese "],
	[/(?:[\s.,!?])(CP)(?:[\s.,!?]|$)/gi, " código postal "],
	[/(?:[\s.,!?])(C por A)(?:[\s.,!?]|$)/gi, " compañía por acciones "],
	[/(?:[\s.,!?])(crec)(?:[\s.,!?]|$)/gi, " creciente "],
	[/(?:[\s.,!?])(cta)(?:[\s.,!?]|$)/gi, " cuenta "],
	[/(?:[\s.,!?])(cta cte)(?:[\s.,!?]|$)/gi, " cuenta corriente "],
	[/(?:[\s.,!?])(Cte)(?:[\s.,!?]|$)/gi, " comandante "],
	[/(?:[\s.,!?])(ctv; ctvo)(?:[\s.,!?]|$)/gi, " centavo "],
	[/(?:[\s.,!?])(d C)(?:[\s.,!?]|$)/gi, " después de Cristo "],
	[/(?:[\s.,!?])(dcho)(?:[\s.,!?]|$)/gi, " derecho "],
	[/(?:[\s.,!?])(del)(?:[\s.,!?]|$)/gi, " delegación "],
	[/(?:[\s.,!?])(depto)(?:[\s.,!?]|$)/gi, " departamento "],
	[/(?:[\s.,!?])(dto)(?:[\s.,!?]|$)/gi, " departamento "],
	[/(?:[\s.,!?])(desct)(?:[\s.,!?]|$)/gi, " descuento "],
	[/(?:[\s.,!?])(DF)(?:[\s.,!?]|$)/gi, " Distrito Federal "],
	[/(?:[\s.,!?])(diag)(?:[\s.,!?]|$)/gi, " diagonal "],
	[/(?:[\s.,!?])(dicc)(?:[\s.,!?]|$)/gi, " diccionario "],
	[/(?:[\s.,!?])(Dir)(?:[\s.,!?]|$)/gi, " director "],
	[/(?:[\s.,!?])(Dir)(?:[\s.,!?]|$)/gi, " dirección "],
	[/(?:[\s.,!?])(D L)(?:[\s.,!?]|$)/gi, " depósito legal "],
	[/(?:[\s.,!?])(Dña)(?:[\s.,!?]|$)/gi, " doña "],
	[/(?:[\s.,!?])(doc)(?:[\s.,!?]|$)/gi, " documento "],
	[/(?:[\s.,!?])(D P)(?:[\s.,!?]|$)/gi, " distrito postal "],
	[/(?:[\s.,!?])(dpto)(?:[\s.,!?]|$)/gi, " departamento "],
	[/(?:[\s.,!?])(Dr)(?:[\s.,!?]|$)/gi, " doctor "],
	[/(?:[\s.,!?])(Dra)(?:[\s.,!?]|$)/gi, " doctora "],
	[/(?:[\s.,!?])(dto)(?:[\s.,!?]|$)/gi, " descuento "],
	[/(?:[\s.,!?])(dupdo)(?:[\s.,!?]|$)/gi, " duplicado "],
	[/(?:[\s.,!?])(e c)(?:[\s.,!?]|$)/gi, " era común "],
	[/(?:[\s.,!?])(ed)(?:[\s.,!?]|$)/gi, " edición "],
	[/(?:[\s.,!?])(ed)(?:[\s.,!?]|$)/gi, " editor "],
	[/(?:[\s.,!?])(ed)(?:[\s.,!?]|$)/gi, " editora "],
	[/(?:[\s.,!?])(edit)(?:[\s.,!?]|$)/gi, " editorial "],
	[/(?:[\s.,!?])(edo)(?:[\s.,!?]|$)/gi, " estado "],
	[/(?:[\s.,!?])(EE UU)(?:[\s.,!?]|$)/gi, " Estados Unidos "],
	[/(?:[\s.,!?])(ef)(?:[\s.,!?]|$)/gi, " efectos "],
	[/(?:[\s.,!?])(ej)(?:[\s.,!?]|$)/gi, " ejemplo "],
	[/(?:[\s.,!?])(Em)(?:[\s.,!?]|$)/gi, " eminencia "],
	[/(?:[\s.,!?])(Emmo)(?:[\s.,!?]|$)/gi, " eminentísimo "],
	[/(?:[\s.,!?])(entlo)(?:[\s.,!?]|$)/gi, " entresuelo "],
	[/(?:[\s.,!?])(e p d)(?:[\s.,!?]|$)/gi, " en paz descanse "],
	[/(?:[\s.,!?])(e p m)(?:[\s.,!?]|$)/gi, " en propia mano "],
	[/(?:[\s.,!?])(e s m)(?:[\s.,!?]|$)/gi, " en sus manos "],
	[/(?:[\s.,!?])(et ál)(?:[\s.,!?]|$)/gi, " et álii "],
	[/(?:[\s.,!?])(etc)(?:[\s.,!?]|$)/gi, " etcétera "],
	[/(?:[\s.,!?])(Exc)(?:[\s.,!?]|$)/gi, " excelencia "],
	[/(?:[\s.,!?])(excl)(?:[\s.,!?]|$)/gi, " exclusive "],
	[/(?:[\s.,!?])(Excmo)(?:[\s.,!?]|$)/gi, " excelentísimo "],
	[/(?:[\s.,!?])(Excma)(?:[\s.,!?]|$)/gi, " excelentísimo "],
	[/(?:[\s.,!?])(f)(?:[\s.,!?]|$)/gi, " folio "],
	[/(?:[\s.,!?])(fª)(?:[\s.,!?]|$)/gi, " factura "],
	[/(?:[\s.,!?])(fasc)(?:[\s.,!?]|$)/gi, " fascículo "],
	[/(?:[\s.,!?])(F C)(?:[\s.,!?]|$)/gi, " ferrocarril "],
	[/(?:[\s.,!?])(fca)(?:[\s.,!?]|$)/gi, " fábrica "],
	[/(?:[\s.,!?])(Fdo)(?:[\s.,!?]|$)/gi, " firmado "],
	[/(?:[\s.,!?])(féc)(?:[\s.,!?]|$)/gi, " fécit "],
	[/(?:[\s.,!?])(FF AA)(?:[\s.,!?]|$)/gi, " Fuerzas Armadas "],
	[/(?:[\s.,!?])(fig)(?:[\s.,!?]|$)/gi, " figura "],
	[/(?:[\s.,!?])(fol)(?:[\s.,!?]|$)/gi, " folio "],
	[/(?:[\s.,!?])(Fr)(?:[\s.,!?]|$)/gi, " fray "],
	[/(?:[\s.,!?])(fra)(?:[\s.,!?]|$)/gi, " factura "],
	[/(?:[\s.,!?])(Gdor)(?:[\s.,!?]|$)/gi, " gobernador "],
	[/(?:[\s.,!?])(Gob)(?:[\s.,!?]|$)/gi, " Gobierno "],
	[/(?:[\s.,!?])(Gdora)(?:[\s.,!?]|$)/gi, " Gobernadora "],
	[/(?:[\s.,!?])(g p)(?:[\s.,!?]|$)/gi, " giro postal "],
	[/(?:[\s.,!?])(Gral)(?:[\s.,!?]|$)/gi, " general "],
	[/(?:[\s.,!?])(g v)(?:[\s.,!?]|$)/gi, " gran velocidad "],
	[/(?:[\s.,!?])(H)(?:[\s.,!?]|$)/gi, " hermano "],
	[/(?:[\s.,!?])(Hno)(?:[\s.,!?]|$)/gi, " hermano "],
	[/(?:[\s.,!?])(Hna)(?:[\s.,!?]|$)/gi, " hermana "],
	[/(?:[\s.,!?])(I)(?:[\s.,!?]|$)/gi, " ilustre "],
	[/(?:[\s.,!?])(ib)(?:[\s.,!?]|$)/gi, " ibídem "],
	[/(?:[\s.,!?])(ibid)(?:[\s.,!?]|$)/gi, " ibídem "],
	[/(?:[\s.,!?])(íd)(?:[\s.,!?]|$)/gi, " ídem "],
	[/(?:[\s.,!?])(i e)(?:[\s.,!?]|$)/gi, " id est "],
	[/(?:[\s.,!?])(igl)(?:[\s.,!?]|$)/gi, " iglesia "],
	[/(?:[\s.,!?])(Il)(?:[\s.,!?]|$)/gi, " ilustre "],
	[/(?:[\s.,!?])(Ilmo)(?:[\s.,!?]|$)/gi, " ilustrísimo "],
	[/(?:[\s.,!?])(Ilma)(?:[\s.,!?]|$)/gi, " ilustrísima "],
	[/(?:[\s.,!?])(Iltre)(?:[\s.,!?]|$)/gi, " ilustre "],
	[/(?:[\s.,!?])(imp)(?:[\s.,!?]|$)/gi, " imprenta "],
	[/(?:[\s.,!?])(impr)(?:[\s.,!?]|$)/gi, " imprenta "],
	[/(?:[\s.,!?])(impr)(?:[\s.,!?]|$)/gi, " impreso "],
	[/(?:[\s.,!?])(impto)(?:[\s.,!?]|$)/gi, " impuesto "],
	[/(?:[\s.,!?])(imp)(?:[\s.,!?]|$)/gi, " impuesto "],
	[/(?:[\s.,!?])(incl)(?:[\s.,!?]|$)/gi, " inclusive "],
	[/(?:[\s.,!?])(Ing)(?:[\s.,!?]|$)/gi, " ingeniero "],
	[/(?:[\s.,!?])(Ing)(?:[\s.,!?]|$)/gi, " ingeniera "],
	[/(?:[\s.,!?])(Inst)(?:[\s.,!?]|$)/gi, " instituto "],
	[/(?:[\s.,!?])(izdo)(?:[\s.,!?]|$)/gi, " izquierdo "],
	[/(?:[\s.,!?])(izda)(?:[\s.,!?]|$)/gi, " izquierda "],
	[/(?:[\s.,!?])(izq)(?:[\s.,!?]|$)/gi, " izquierda "],
	[/(?:[\s.,!?])(izq)(?:[\s.,!?]|$)/gi, " izquierdo "],
	[/(?:[\s.,!?])(J C)(?:[\s.,!?]|$)/gi, " Jesucristo "],
	[/(?:[\s.,!?])(Jhs)(?:[\s.,!?]|$)/gi, " Jesús "],
	[/(?:[\s.,!?])(JJ OO)(?:[\s.,!?]|$)/gi, " Juegos Olímpicos "],
	[/(?:[\s.,!?])(JJOO)(?:[\s.,!?]|$)/gi, " Juegos Olímpicos "],
	[/(?:[\s.,!?])(k o)(?:[\s.,!?]|$)/gi, " knock-out "],
	[/(?:[\s.,!?])(ko)(?:[\s.,!?]|$)/gi, " knock-out "],
	[/(?:[\s.,!?])(l c)(?:[\s.,!?]|$)/gi, " loco citato "],
	[/(?:[\s.,!?])(lc)(?:[\s.,!?]|$)/gi, " loco citato "],
	[/(?:[\s.,!?])(Lcdo)(?:[\s.,!?]|$)/gi, " licenciado "],
	[/(?:[\s.,!?])(Lcda)(?:[\s.,!?]|$)/gi, " licenciada "],
	[/(?:[\s.,!?])(Lic)(?:[\s.,!?]|$)/gi, " licenciado "],
	[/(?:[\s.,!?])(Lic)(?:[\s.,!?]|$)/gi, " licenciada "],
	[/(?:[\s.,!?])(loc cit)(?:[\s.,!?]|$)/gi, " loco citato "],
	[/(?:[\s.,!?])(Ltd)(?:[\s.,!?]|$)/gi, " limited "],
	[/(?:[\s.,!?])(Ltdo)(?:[\s.,!?]|$)/gi, " limitado "],
	[/(?:[\s.,!?])(Ltda)(?:[\s.,!?]|$)/gi, " limitada "],
	[/(?:[\s.,!?])(m)(?:[\s.,!?]|$)/gi, " meridies "],
	[/(?:[\s.,!?])(Magfco)(?:[\s.,!?]|$)/gi, " magnífico "],
	[/(?:[\s.,!?])(Magfca)(?:[\s.,!?]|$)/gi, " magnífica "],
	[/(?:[\s.,!?])(máx)(?:[\s.,!?]|$)/gi, " máximo "],
	[/(?:[\s.,!?])(M)(?:[\s.,!?]|$)/gi, " madre "],
	[/(?:[\s.,!?])(mín)(?:[\s.,!?]|$)/gi, " mínimo "],
	[/(?:[\s.,!?])(m n)(?:[\s.,!?]|$)/gi, " moneda nacional "],
	[/(?:[\s.,!?])(Mons)(?:[\s.,!?]|$)/gi, " monseñor "],
	[/(?:[\s.,!?])(mr)(?:[\s.,!?]|$)/gi, " mártir "],
	[/(?:[\s.,!?])(ms)(?:[\s.,!?]|$)/gi, " manuscrito "],
	[/(?:[\s.,!?])(n)(?:[\s.,!?]|$)/gi, " nota "],
	[/(?:[\s.,!?])(N B)(?:[\s.,!?]|$)/gi, " nota bene "],
	[/(?:[\s.,!?])(N del T)(?:[\s.,!?]|$)/gi, " nota del traductor "],
	[/(?:[\s.,!?])(nro)(?:[\s.,!?]|$)/gi, " número "],
	[/(?:[\s.,!?])(n)(?:[\s.,!?]|$)/gi, " número "],
	[/(?:[\s.,!?])(Ntra)(?:[\s.,!?]|$)/gi, " Nuestra "],
	[/(?:[\s.,!?])(Ntro)(?:[\s.,!?]|$)/gi, " Nuestro "],
	[/(?:[\s.,!?])(núm)(?:[\s.,!?]|$)/gi, " número "],
	[/(?:[\s.,!?])(Ob)(?:[\s.,!?]|$)/gi, " obispo "],
	[/(?:[\s.,!?])(ob cit)(?:[\s.,!?]|$)/gi, " obra citada "],
	[/(?:[\s.,!?])(O F M)(?:[\s.,!?]|$)/gi, " Orden de frailes menores "],
	[/(?:[\s.,!?])(óp cit)(?:[\s.,!?]|$)/gi, " ópere citato "],
	[/(?:[\s.,!?])(p)(?:[\s.,!?]|$)/gi, " página "],
	[/(?:[\s.,!?])(pág)(?:[\s.,!?]|$)/gi, " página "],
	[/(?:[\s.,!?])(párr)(?:[\s.,!?]|$)/gi, " párrafo "],
	[/(?:[\s.,!?])(Pat)(?:[\s.,!?]|$)/gi, " patente "],
	[/(?:[\s.,!?])(P D)(?:[\s.,!?]|$)/gi, " posdata "],
	[/(?:[\s.,!?])(pdo)(?:[\s.,!?]|$)/gi, " pasado "],
	[/(?:[\s.,!?])(Pdte)(?:[\s.,!?]|$)/gi, " presidente "],
	[/(?:[\s.,!?])(Pdta)(?:[\s.,!?]|$)/gi, " presidenta "],
	[/(?:[\s.,!?])(Pte)(?:[\s.,!?]|$)/gi, " presidente "],
	[/(?:[\s.,!?])(Pta)(?:[\s.,!?]|$)/gi, " presidenta "],
	[/(?:[\s.,!?])(p ej)(?:[\s.,!?]|$)/gi, " por ejemplo "],
	[/(?:[\s.,!?])(pg)(?:[\s.,!?]|$)/gi, " página "],
	[/(?:[\s.,!?])(p k)(?:[\s.,!?]|$)/gi, " punto kilométrico "],
	[/(?:[\s.,!?])(pl)(?:[\s.,!?]|$)/gi, " plaza "],
	[/(?:[\s.,!?])(ppal)(?:[\s.,!?]|$)/gi, " principal "],
	[/(?:[\s.,!?])(Presb)(?:[\s.,!?]|$)/gi, " presbítero "],
	[/(?:[\s.,!?])(Prof)(?:[\s.,!?]|$)/gi, " profesor "],
	[/(?:[\s.,!?])(pról)(?:[\s.,!?]|$)/gi, " prólogo "],
	[/(?:[\s.,!?])(prov)(?:[\s.,!?]|$)/gi, " provincia "],
	[/(?:[\s.,!?])(P S)(?:[\s.,!?]|$)/gi, " post scríptum "],
	[/(?:[\s.,!?])(p v)(?:[\s.,!?]|$)/gi, " pequeña velocidad "],
	[/(?:[\s.,!?])(P V P)(?:[\s.,!?]|$)/gi, " precio de venta al público "],
	[/(?:[\s.,!?])(pza)(?:[\s.,!?]|$)/gi, " plaza "],
	[/(?:[\s.,!?])(R D)(?:[\s.,!?]|$)/gi, " República Dominicana "],
	[/(?:[\s.,!?])(reg)(?:[\s.,!?]|$)/gi, " registro "],
	[/(?:[\s.,!?])(Rep)(?:[\s.,!?]|$)/gi, " república "],
	[/(?:[\s.,!?])(R I P)(?:[\s.,!?]|$)/gi, " requiéscat in pace "],
	[/(?:[\s.,!?])(RR HH)(?:[\s.,!?]|$)/gi, " recursos humanos "],
	[/(?:[\s.,!?])(Rte)(?:[\s.,!?]|$)/gi, " remitente "],
	[/(?:[\s.,!?])(S A)(?:[\s.,!?]|$)/gi, " sociedad anónima "],
	[/(?:[\s.,!?])(Sdad)(?:[\s.,!?]|$)/gi, " sociedad "],
	[/(?:[\s.,!?])(Sgto)(?:[\s.,!?]|$)/gi, " sargento "],
	[/(?:[\s.,!?])(sig)(?:[\s.,!?]|$)/gi, " siguiente "],
	[/(?:[\s.,!?])(S L)(?:[\s.,!?]|$)/gi, " sociedad limitada "],
	[/(?:[\s.,!?])(S M)(?:[\s.,!?]|$)/gi, " su majestad "],
	[/(?:[\s.,!?])(Soc)(?:[\s.,!?]|$)/gi, " sociedad "],
	[/(?:[\s.,!?])(S P)(?:[\s.,!?]|$)/gi, " servicio público "],
	[/(?:[\s.,!?])(Sr)(?:[\s.,!?]|$)/gi, " Señor "],
	[/(?:[\s.,!?])(Sra)(?:[\s.,!?]|$)/gi, " señora "],
	[/(?:[\s.,!?])(S R C)(?:[\s.,!?]|$)/gi, " se ruega contestación "],
	[/(?:[\s.,!?])(Srta)(?:[\s.,!?]|$)/gi, " señorita "],
	[/(?:[\s.,!?])(S S)(?:[\s.,!?]|$)/gi, " su santidad "],
	[/(?:[\s.,!?])(Sto)(?:[\s.,!?]|$)/gi, " Santo "],
	[/(?:[\s.,!?])(Sta)(?:[\s.,!?]|$)/gi, " Santa "],
	[/(?:[\s.,!?])(t)(?:[\s.,!?]|$)/gi, " tomo "],
	[/(?:[\s.,!?])(teléf)(?:[\s.,!?]|$)/gi, " teléfono "],
	[/(?:[\s.,!?])(tel)(?:[\s.,!?]|$)/gi, " teléfono "],
	[/(?:[\s.,!?])(test)(?:[\s.,!?]|$)/gi, " testigo "],
	[/(?:[\s.,!?])(tfno)(?:[\s.,!?]|$)/gi, " teléfono "],
	[/(?:[\s.,!?])(tít)(?:[\s.,!?]|$)/gi, " título "],
	[/(?:[\s.,!?])(trad)(?:[\s.,!?]|$)/gi, " traducción "],
	[/(?:[\s.,!?])(Tte)(?:[\s.,!?]|$)/gi, " teniente "],
	[/(?:[\s.,!?])(Ud)(?:[\s.,!?]|$)/gi, " usted "],
	[/(?:[\s.,!?])(Univ)(?:[\s.,!?]|$)/gi, " universidad "],
	[/(?:[\s.,!?])(v)(?:[\s.,!?]|$)/gi, " véase "],
	[/(?:[\s.,!?])(V)(?:[\s.,!?]|$)/gi, " verso "],
	[/(?:[\s.,!?])(Valmte)(?:[\s.,!?]|$)/gi, " vicealmirante "],
	[/(?:[\s.,!?])(Vdo)(?:[\s.,!?]|$)/gi, " viudo "],
	[/(?:[\s.,!?])(v)(?:[\s.,!?]|$)/gi, " vuelto "],
	[/(?:[\s.,!?])(vol)(?:[\s.,!?]|$)/gi, " volumen "],
	[/(?:[\s.,!?])(vs)(?:[\s.,!?]|$)/gi, " versus "],
	[/(?:[\s.,!?])(V S)(?:[\s.,!?]|$)/gi, " vuestra señoría "],
	[/(?:[\s.,!?])(vto)(?:[\s.,!?]|$)/gi, " vencimiento "],
	[/(?:[\s.,!?])(vto)(?:[\s.,!?]|$)/gi, " vuelto "],
	[/(?:[\s.,!?])(vta)(?:[\s.,!?]|$)/gi, " vuelta "],
	[/(?:[\s.,!?])(vv aa)(?:[\s.,!?]|$)/gi, " varios autores "],
	[/(?:[\s.,!?])(WC)(?:[\s.,!?]|$)/gi, " water closet "],
	[/(?:[\s.,!?])(gr)(?:[\s.,!?]|$)/gi, " gramos "],
	[/(?:[\s.,!?])(flia)(?:[\s.,!?]|$)/gi, " familia "],
	[/(?:[\s.,!?])(flia)(?:[\s.,!?]|$)/gi, " familia "],
	[/(?:[\s.,!?])(conv)(?:[\s.,!?]|$)/gi, " conversación "],
	[/(?:[\s.,!?])(conv)(?:[\s.,!?]|$)/gi, " conversación "],
	[/(?:[\s.,!?])(mr)(?:[\s.,!?]|$)/gi, " Mr "],
	[/(?:[\s.,!?])(mrs)(?:[\s.,!?]|$)/gi, " Mrs "],
	[/(?:[\s.,!?])(sr)(?:[\s.,!?]|$)/gi, " Sr "],
	[/(?:[\s.,!?])(sra)(?:[\s.,!?]|$)/gi, " Sra"]
];

const signRules = [
	[/(?:[\s.,!?])(que)(?:[\s.,!?]|$)/gi, " qué "],
	[/(?:[\s.,!?])(cual)(?:[\s.,!?]|$)/gi, " cuál "],
	[/(?:[\s.,!?])(cuales)(?:[\s.,!?]|$)/gi, " cuáles "],
	[/(?:[\s.,!?])(quien)(?:[\s.,!?]|$)/gi, " quién "],
	[/(?:[\s.,!?])(quienes)(?:[\s.,!?]|$)/gi, " quiénes "],
	[/(?:[\s.,!?])(como)(?:[\s.,!?]|$)/gi, " cómo "],
	[/(?:[\s.,!?])(cuan)(?:[\s.,!?]|$)/gi, " cuán "],
	[/(?:[\s.,!?])(cuanto)(?:[\s.,!?]|$)/gi, " cuánto "],
	[/(?:[\s.,!?])(cuanta)(?:[\s.,!?]|$)/gi, " cuánta "],
	[/(?:[\s.,!?])(cuantos)(?:[\s.,!?]|$)/gi, " cuántos "],
	[/(?:[\s.,!?])(cuantas)(?:[\s.,!?]|$)/gi, " cuántas "],
	[/(?:[\s.,!?])(cuando)(?:[\s.,!?]|$)/gi, " cuándo "],
	[/(?:[\s.,!?])(donde)(?:[\s.,!?]|$)/gi, " dónde "],
	[/(?:[\s.,!?])(adonde)(?:[\s.,!?]|$)/gi, " adónde"]
];

const spellcheck = function(query, toRegion){
	return new Promise( (resolve, reject) => {
		const workableQuery = query
			.toLowerCase()
			.replace("  ", " ")
			.replace(/[^áéíóúña-z\s]/gi, '');
			
		const words = [...new Set(workableQuery.split(" "))],
			searchWord = [];
		
		words.forEach( (word, i) => {
			if(!articleze.isArticle(word)){
				searchWord.push(word);
			}
		});
		
		getWords(searchWord, toRegion)
		.then( (translatedWords) => {
			const oldPhrase = query.replace("  ", " ").split(" "), newPhrase = [], sugoi = {};
			for(const oWord of oldPhrase){
				
				const word = oWord.match(/([áéíóúña-z]{1,})/gi)[0];
				
				if(articleze.isArticle(word)){
					newPhrase.push(oWord);
					continue;
				}
				
				let keyword = word.toLowerCase();
				if(translatedWords.hasOwnProperty(keyword)){
					
					if(translatedWords[keyword].found){
						newPhrase.push(oWord);
						continue;
					}else if(translatedWords[keyword].suggestions.length > 0){
						
						let replaceWord;
						
						sugoi[keyword] = translatedWords[keyword].suggestions;
						
						if(translatedWords[keyword].suggestions.length == 1){
							replaceWord = translatedWords[keyword].suggestions[0];
						}else{
							
							const ogSuggestions = translatedWords[keyword].suggestions;
							const fixedSuggestions = [];
							for(let sug of ogSuggestions){
								
								if(sug.charAt(0) == "h")
									sug = sug.substr(1);
								
								sug = sug.replace("á", "a");
								sug = sug.replace("é", "é");
								sug = sug.replace("í", "i");
								sug = sug.replace("ó", "o");
								sug = sug.replace("ú", "u");
								
								fixedSuggestions.push(sug);
							}
							
							const matches = stringSimilarity.findBestMatch(keyword, fixedSuggestions);
							const bestMatch = matches.bestMatch;
							//console.log(bestMatch);
							replaceWord = ogSuggestions[matches.bestMatchIndex];
						}
						
						newPhrase.push(oWord.replace(/([áéíóúña-z]{1,})/ig, restoreCase(word, replaceWord)));
					}
				}else{
					newPhrase.push(oWord.replace(/([áéíóúña-z]{1,})/ig, word));
				}
			}
			
			
			let phrase = ` ${newPhrase.join(" ")} `;
			
			for(const doub of rules){
				phrase = phrase.replace(doub[0], doub[1]);
			}
			
			for(const abr of abbr){
				phrase = phrase.replace(abr[0], abr[1]);
			}
			
			const doc = lorca(phrase);
			const sentences = doc.sentences().get();
			
			console.log(sentences);
			
			const ret = {
				phrase : phrase,
				suggestions: sugoi
			};
			
			resolve(ret);
		})
		.catch( (e) => {
			reject(e);
		});
	});
};

module.exports = spellcheck;