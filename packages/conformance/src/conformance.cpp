#include <cmath>
#include <conformance/cases/float.hpp>
#include <conformance/conformance.hpp>
#include <cstring>

namespace wharfkit {

using namespace cases;

namespace {

// Sections are appended in this order and never reordered; ids within a section are sequential.
struct section
{
   const char* width;
   const char* op;
   enum kind_t
   {
      ECHO,
      BINARY,
      TOINT_S32,
      TOINT_U32,
      TOINT_S64,
      TOINT_U64,
      FROMINT_K,
      FROMINT128_K,
      AMT_K,
      Q_ECHO,
      Q_BINARY
   } kind;
};

constexpr section SECTIONS[] = {
   {"fs", "echo", section::ECHO},
   {"fd", "echo", section::ECHO},
   {"fs", "add", section::BINARY},
   {"fs", "sub", section::BINARY},
   {"fs", "mul", section::BINARY},
   {"fs", "div", section::BINARY},
   {"fd", "add", section::BINARY},
   {"fd", "sub", section::BINARY},
   {"fd", "mul", section::BINARY},
   {"fd", "div", section::BINARY},
   {"fs", "min", section::BINARY},
   {"fs", "max", section::BINARY},
   {"fs", "copysign", section::BINARY},
   {"fd", "min", section::BINARY},
   {"fd", "max", section::BINARY},
   {"fd", "copysign", section::BINARY},
   {"fs", "floor", section::ECHO},
   {"fs", "ceil", section::ECHO},
   {"fs", "trunc", section::ECHO},
   {"fs", "nearest", section::ECHO},
   {"fs", "round", section::ECHO},
   {"fs", "sqrt", section::ECHO},
   {"fs", "neg", section::ECHO},
   {"fs", "abs", section::ECHO},
   {"fd", "floor", section::ECHO},
   {"fd", "ceil", section::ECHO},
   {"fd", "trunc", section::ECHO},
   {"fd", "nearest", section::ECHO},
   {"fd", "round", section::ECHO},
   {"fd", "sqrt", section::ECHO},
   {"fd", "neg", section::ECHO},
   {"fd", "abs", section::ECHO},
   {"fs", "eq", section::BINARY},
   {"fs", "ne", section::BINARY},
   {"fs", "lt", section::BINARY},
   {"fs", "le", section::BINARY},
   {"fs", "gt", section::BINARY},
   {"fs", "ge", section::BINARY},
   {"fd", "eq", section::BINARY},
   {"fd", "ne", section::BINARY},
   {"fd", "lt", section::BINARY},
   {"fd", "le", section::BINARY},
   {"fd", "gt", section::BINARY},
   {"fd", "ge", section::BINARY},

   {"fs", "tofd", section::ECHO},
   {"fd", "tofs", section::ECHO},
   {"fs", "tois", section::TOINT_S32},
   {"fs", "tous", section::TOINT_U32},
   {"fs", "toil", section::TOINT_S64},
   {"fs", "toul", section::TOINT_U64},
   {"fd", "tois", section::TOINT_S32},
   {"fd", "tous", section::TOINT_U32},
   {"fd", "toil", section::TOINT_S64},
   {"fd", "toul", section::TOINT_U64},
   {"fs", "fromis", section::FROMINT_K},
   {"fs", "fromus", section::FROMINT_K},
   {"fs", "fromil", section::FROMINT_K},
   {"fs", "fromul", section::FROMINT_K},
   {"fd", "fromis", section::FROMINT_K},
   {"fd", "fromus", section::FROMINT_K},
   {"fd", "fromil", section::FROMINT_K},
   {"fd", "fromul", section::FROMINT_K},
   {"fd", "toamt", section::AMT_K},
   {"", "amttofd", section::AMT_K},

   {"fs", "toix", section::TOINT_S64},
   {"fs", "toux", section::TOINT_U64},
   {"fd", "toix", section::TOINT_S64},
   {"fd", "toux", section::TOINT_U64},
   {"fd", "fromix", section::FROMINT128_K},
   {"fd", "fromux", section::FROMINT128_K},

   {"fs", "tofq", section::ECHO},
   {"fd", "tofq", section::ECHO},
   {"fq", "echo", section::Q_ECHO},
   {"fq", "add", section::Q_BINARY},
   {"fq", "sub", section::Q_BINARY},
   {"fq", "mul", section::Q_BINARY},
   {"fq", "div", section::Q_BINARY},
   {"fq", "neg", section::Q_ECHO},
   {"fq", "eq", section::Q_BINARY},
   {"fq", "ne", section::Q_BINARY},
   {"fq", "lt", section::Q_BINARY},
   {"fq", "le", section::Q_BINARY},
   {"fq", "gt", section::Q_BINARY},
   {"fq", "ge", section::Q_BINARY},
   {"fq", "unord", section::Q_BINARY},
   {"fq", "tofs", section::Q_ECHO},
   {"fq", "tofd", section::Q_ECHO},
   {"fq", "tois", section::TOINT_S32},
   {"fq", "tous", section::TOINT_U32},
   {"fq", "toil", section::TOINT_S64},
   {"fq", "toul", section::TOINT_U64},
   {"fq", "toix", section::TOINT_S64},
   {"fq", "toux", section::TOINT_U64},
   {"fq", "fromis", section::FROMINT_K},
   {"fq", "fromus", section::FROMINT_K},
   {"fq", "fromil", section::FROMINT_K},
   {"fq", "fromul", section::FROMINT_K},
};
constexpr uint32_t SECTION_COUNT = sizeof(SECTIONS) / sizeof(SECTIONS[0]);

// Every entry is exact as a double, so scaling is a single rounding. Stays double: fdtoamt sits below fq_start.
constexpr double POW10[19] = {1e0,  1e1,  1e2,  1e3,  1e4,  1e5,  1e6,  1e7,  1e8, 1e9,
                              1e10, 1e11, 1e12, 1e13, 1e14, 1e15, 1e16, 1e17, 1e18};

// The toix/toux/fromix/fromux ops need __fixsfti-family intrinsics that only nodeos provides.
bool is_wide_int_op(const char* op)
{
   size_t n = std::strlen(op);
   return n >= 2 && op[n - 1] == 'x' && (op[n - 2] == 'i' || op[n - 2] == 'u');
}

uint32_t section_size(const section& s)
{
   switch (s.kind) {
   case section::ECHO:
      return POOL_SIZE;
   case section::BINARY:
      return PAIRS_SIZE;
   case section::TOINT_S32:
      return TOINT_SAFE_SIZE;
   case section::TOINT_U32:
      return TOINT_SAFE_U_SIZE;
   case section::TOINT_S64:
      return TOINT_SAFE_SIZE + TOINT_WIDE_SIZE;
   case section::TOINT_U64:
      return TOINT_SAFE_U_SIZE + TOINT_WIDE_SIZE;
   case section::FROMINT_K:
      return (std::strcmp(s.op, "fromis") == 0 || std::strcmp(s.op, "fromus") == 0) ? FROMINT_NARROW_SIZE
                                                                                    : FROMINT_SIZE;
   case section::FROMINT128_K:
      return FROMINT128_SIZE;
   case section::AMT_K:
      return AMT_SIZE;
   case section::Q_ECHO:
      return Q_POOL_SIZE;
   case section::Q_BINARY:
      return Q_PAIRS_SIZE;
   }
   return 0;
}

uint32_t grid_size()
{
   uint32_t n = 0;
   for (uint32_t i = 0; i < SECTION_COUNT; i++)
      n += section_size(SECTIONS[i]);
   return n;
}

// First id whose op cannot execute outside nodeos. The wide-int and fq sections are the tail of the grid.
uint32_t fq_start()
{
   uint32_t n = 0;
   for (uint32_t i = 0; i < SECTION_COUNT; i++) {
      if (is_wide_int_op(SECTIONS[i].op))
         break;
      n += section_size(SECTIONS[i]);
   }
   return n;
}

name make_op(const char* width, const char* op)
{
   char buf[13] = {0};
   std::strncpy(buf, width, 2);
   std::strncat(buf, op, 10);
   return name(buf);
}

// Resolve grid id -> fp_spec. Returns false when id is out of range.
bool spec_at(uint32_t id, fp_spec& out)
{
   uint32_t base = 0;
   for (uint32_t i = 0; i < SECTION_COUNT; i++) {
      const section& s    = SECTIONS[i];
      uint32_t       size = section_size(s);
      if (id < base + size) {
         uint32_t k = id - base;
         out        = fp_spec{};
         out.id     = id;
         out.op     = make_op(s.width, s.op);
         out.width  = s.width;
         switch (s.kind) {
         case section::ECHO:
            out.a     = POOL[k];
            out.label = POOL_LABELS[k];
            break;
         case section::BINARY:
            out.a     = PAIRS[k].a;
            out.b     = PAIRS[k].b;
            out.label = PAIRS[k].label;
            break;
         case section::TOINT_S32:
            out.a     = TOINT_SAFE[k];
            out.label = TOINT_SAFE_LABELS[k];
            break;
         case section::TOINT_U32:
            out.a     = TOINT_SAFE_U[k];
            out.label = TOINT_SAFE_U_LABELS[k];
            break;
         case section::TOINT_S64:
            out.a     = k < TOINT_SAFE_SIZE ? TOINT_SAFE[k] : TOINT_WIDE[k - TOINT_SAFE_SIZE];
            out.label = k < TOINT_SAFE_SIZE ? TOINT_SAFE_LABELS[k] : TOINT_WIDE_LABELS[k - TOINT_SAFE_SIZE];
            break;
         case section::TOINT_U64:
            out.a     = k < TOINT_SAFE_U_SIZE ? TOINT_SAFE_U[k] : TOINT_WIDE[k - TOINT_SAFE_U_SIZE];
            out.label = k < TOINT_SAFE_U_SIZE ? TOINT_SAFE_U_LABELS[k] : TOINT_WIDE_LABELS[k - TOINT_SAFE_U_SIZE];
            break;
         case section::FROMINT_K:
            out.i     = std::strcmp(s.op, "fromus") == 0 ? (int64_t)(int32_t)FROMINT[k] : FROMINT[k];
            out.label = FROMINT_LABELS[k];
            break;
         case section::FROMINT128_K:
            out.x     = FROMINT128[k];
            out.label = FROMINT128_LABELS[k];
            break;
         case section::AMT_K:
            out.p = AMT[k].precision;
            if (std::strcmp(s.op, "toamt") == 0)
               out.a = AMT[k].v;
            else
               out.i = AMT[k].units;
            out.label = std::string(AMT[k].label) + " p" + std::to_string(AMT[k].precision);
            break;
         case section::Q_ECHO:
            out.a128  = Q_POOL[k];
            out.label = Q_POOL_LABELS[k];
            break;
         case section::Q_BINARY:
            out.a128  = Q_PAIRS[k].a;
            out.b128  = Q_PAIRS[k].b;
            out.label = Q_PAIRS[k].label;
            break;
         }
         // fq to-int and from-int sections draw their operand from the double pools; widening is an fq-range call.
         if (std::strcmp(s.width, "fq") == 0 && s.kind != section::Q_ECHO && s.kind != section::Q_BINARY)
            out.a128 = (long double)out.a;
         return true;
      }
      base += size;
   }
   return false;
}

fp_case case_from_spec(const fp_spec& s)
{
   fp_case c;
   c.id    = s.id;
   c.label = s.label;
   if (std::strcmp(s.width, "fs") == 0) {
      c.a32 = (float)s.a;
      c.b32 = (float)s.b;
   } else if (std::strcmp(s.width, "fq") == 0) {
      c.a128 = s.a128;
      c.b128 = s.b128;
   } else {
      c.a64 = s.a;
      c.b64 = s.b;
   }
   c.ri = s.i;
   c.ax = s.x;
   return c;
}

// Only these ops may evaluate a long double, which keeps every id below fq_start free of __*tf* calls.
bool touches_fq(name op)
{
   std::string s = op.to_string();
   return s.compare(0, 2, "fq") == 0 || (s.size() >= 4 && s.compare(s.size() - 4, 4, "tofq") == 0);
}

} // namespace

fp_case conformance::compute(name op, fp_case in, uint8_t precision)
{
   fp_case c = in;
   c.op      = op;
   switch (op.value) {
   case "fsecho"_n.value:
      c.r32 = c.a32;
      break;
   case "fsadd"_n.value:
      c.r32 = c.a32 + c.b32;
      break;
   case "fssub"_n.value:
      c.r32 = c.a32 - c.b32;
      break;
   case "fsmul"_n.value:
      c.r32 = c.a32 * c.b32;
      break;
   case "fsdiv"_n.value:
      c.r32 = c.a32 / c.b32;
      break;
   case "fdecho"_n.value:
      c.r64 = c.a64;
      break;
   case "fdadd"_n.value:
      c.r64 = c.a64 + c.b64;
      break;
   case "fdsub"_n.value:
      c.r64 = c.a64 - c.b64;
      break;
   case "fdmul"_n.value:
      c.r64 = c.a64 * c.b64;
      break;
   case "fddiv"_n.value:
      c.r64 = c.a64 / c.b64;
      break;
   case "fsmin"_n.value:
      c.r32 = __builtin_fminf(c.a32, c.b32);
      break;
   case "fsmax"_n.value:
      c.r32 = __builtin_fmaxf(c.a32, c.b32);
      break;
   case "fscopysign"_n.value:
      c.r32 = __builtin_copysignf(c.a32, c.b32);
      break;
   case "fsfloor"_n.value:
      c.r32 = __builtin_floorf(c.a32);
      break;
   case "fsceil"_n.value:
      c.r32 = __builtin_ceilf(c.a32);
      break;
   case "fstrunc"_n.value:
      c.r32 = __builtin_truncf(c.a32);
      break;
   case "fsnearest"_n.value:
      c.r32 = __builtin_nearbyintf(c.a32);
      break;
   case "fsround"_n.value:
      c.r32 = __builtin_roundf(c.a32);
      break;
   case "fssqrt"_n.value:
      c.r32 = __builtin_sqrtf(c.a32);
      break;
   case "fsneg"_n.value:
      c.r32 = -c.a32;
      break;
   case "fsabs"_n.value:
      c.r32 = __builtin_fabsf(c.a32);
      break;
   case "fseq"_n.value:
      c.rb = c.a32 == c.b32;
      break;
   case "fsne"_n.value:
      c.rb = c.a32 != c.b32;
      break;
   case "fslt"_n.value:
      c.rb = c.a32 < c.b32;
      break;
   case "fsle"_n.value:
      c.rb = c.a32 <= c.b32;
      break;
   case "fsgt"_n.value:
      c.rb = c.a32 > c.b32;
      break;
   case "fsge"_n.value:
      c.rb = c.a32 >= c.b32;
      break;
   case "fdmin"_n.value:
      c.r64 = __builtin_fmin(c.a64, c.b64);
      break;
   case "fdmax"_n.value:
      c.r64 = __builtin_fmax(c.a64, c.b64);
      break;
   case "fdcopysign"_n.value:
      c.r64 = __builtin_copysign(c.a64, c.b64);
      break;
   case "fdfloor"_n.value:
      c.r64 = __builtin_floor(c.a64);
      break;
   case "fdceil"_n.value:
      c.r64 = __builtin_ceil(c.a64);
      break;
   case "fdtrunc"_n.value:
      c.r64 = __builtin_trunc(c.a64);
      break;
   case "fdnearest"_n.value:
      c.r64 = __builtin_nearbyint(c.a64);
      break;
   case "fdround"_n.value:
      c.r64 = __builtin_round(c.a64);
      break;
   case "fdsqrt"_n.value:
      c.r64 = __builtin_sqrt(c.a64);
      break;
   case "fdneg"_n.value:
      c.r64 = -c.a64;
      break;
   case "fdabs"_n.value:
      c.r64 = __builtin_fabs(c.a64);
      break;
   case "fdeq"_n.value:
      c.rb = c.a64 == c.b64;
      break;
   case "fdne"_n.value:
      c.rb = c.a64 != c.b64;
      break;
   case "fdlt"_n.value:
      c.rb = c.a64 < c.b64;
      break;
   case "fdle"_n.value:
      c.rb = c.a64 <= c.b64;
      break;
   case "fdgt"_n.value:
      c.rb = c.a64 > c.b64;
      break;
   case "fdge"_n.value:
      c.rb = c.a64 >= c.b64;
      break;
   case "fstofd"_n.value:
      c.r64 = (double)c.a32;
      break;
   case "fdtofs"_n.value:
      c.r32 = (float)c.a64;
      break;
   case "fstois"_n.value:
      c.ri = (int32_t)c.a32;
      break;
   case "fstous"_n.value:
      c.ri = (uint32_t)c.a32;
      break;
   case "fstoil"_n.value:
      c.ri = (int64_t)c.a32;
      break;
   case "fstoul"_n.value:
      c.ri = (int64_t)(uint64_t)c.a32;
      break;
   case "fstoix"_n.value:
      c.rx = (int128_t)c.a32;
      break;
   case "fstoux"_n.value:
      c.rx = (int128_t)(uint128_t)c.a32;
      break;
   case "fdtois"_n.value:
      c.ri = (int32_t)c.a64;
      break;
   case "fdtous"_n.value:
      c.ri = (uint32_t)c.a64;
      break;
   case "fdtoil"_n.value:
      c.ri = (int64_t)c.a64;
      break;
   case "fdtoul"_n.value:
      c.ri = (int64_t)(uint64_t)c.a64;
      break;
   case "fdtoix"_n.value:
      c.rx = (int128_t)c.a64;
      break;
   case "fdtoux"_n.value:
      c.rx = (int128_t)(uint128_t)c.a64;
      break;
   case "fsfromis"_n.value:
      c.r32 = (float)(int32_t)c.ri;
      break;
   case "fsfromus"_n.value:
      c.r32 = (float)(uint32_t)c.ri;
      break;
   case "fsfromil"_n.value:
      c.r32 = (float)c.ri;
      break;
   case "fsfromul"_n.value:
      c.r32 = (float)(uint64_t)c.ri;
      break;
   case "fdfromis"_n.value:
      c.r64 = (double)(int32_t)c.ri;
      break;
   case "fdfromus"_n.value:
      c.r64 = (double)(uint32_t)c.ri;
      break;
   case "fdfromil"_n.value:
      c.r64 = (double)c.ri;
      break;
   case "fdfromul"_n.value:
      c.r64 = (double)(uint64_t)c.ri;
      break;
   case "fdfromix"_n.value:
      c.r64 = (double)c.ax;
      break;
   case "fdfromux"_n.value:
      c.r64 = (double)(uint128_t)c.ax;
      break;
   case "fstofq"_n.value:
      c.r128 = (long double)c.a32;
      break;
   case "fdtofq"_n.value:
      c.r128 = (long double)c.a64;
      break;
   case "fqecho"_n.value:
      c.r128 = c.a128;
      break;
   case "fqadd"_n.value:
      c.r128 = c.a128 + c.b128;
      break;
   case "fqsub"_n.value:
      c.r128 = c.a128 - c.b128;
      break;
   case "fqmul"_n.value:
      c.r128 = c.a128 * c.b128;
      break;
   case "fqdiv"_n.value:
      c.r128 = c.a128 / c.b128;
      break;
   case "fqneg"_n.value:
      c.r128 = -c.a128;
      break;
   case "fqeq"_n.value:
      c.rb = c.a128 == c.b128;
      break;
   case "fqne"_n.value:
      c.rb = c.a128 != c.b128;
      break;
   case "fqlt"_n.value:
      c.rb = c.a128 < c.b128;
      break;
   case "fqle"_n.value:
      c.rb = c.a128 <= c.b128;
      break;
   case "fqgt"_n.value:
      c.rb = c.a128 > c.b128;
      break;
   case "fqge"_n.value:
      c.rb = c.a128 >= c.b128;
      break;
   case "fqunord"_n.value:
      c.rb = __builtin_isunordered(c.a128, c.b128);
      break;
   case "fqtofs"_n.value:
      c.r32 = (float)c.a128;
      break;
   case "fqtofd"_n.value:
      c.r64 = (double)c.a128;
      break;
   case "fqtois"_n.value:
      c.ri = (int32_t)c.a128;
      break;
   case "fqtous"_n.value:
      c.ri = (uint32_t)c.a128;
      break;
   case "fqtoil"_n.value:
      c.ri = (int64_t)c.a128;
      break;
   case "fqtoul"_n.value:
      c.ri = (int64_t)(uint64_t)c.a128;
      break;
   case "fqtoix"_n.value:
      c.rx = (int128_t)c.a128;
      break;
   case "fqtoux"_n.value:
      c.rx = (int128_t)(uint128_t)c.a128;
      break;
   case "fqfromis"_n.value:
      c.r128 = (long double)(int32_t)c.ri;
      break;
   case "fqfromus"_n.value:
      c.r128 = (long double)(uint32_t)c.ri;
      break;
   case "fqfromil"_n.value:
      c.r128 = (long double)c.ri;
      break;
   case "fqfromul"_n.value:
      c.r128 = (long double)(uint64_t)c.ri;
      break;
   case "fdtoamt"_n.value:
   {
      check(precision < 19, "precision out of range");
      const double scaled = c.a64 * POW10[precision];
      c.ri                = (int64_t)scaled;
      c.r64               = (double)__builtin_llround(scaled);
      break;
   }
   case "amttofd"_n.value:
   {
      double divisor = 1.0;
      for (uint8_t i = 0; i < precision; i++)
         divisor *= 10.0;
      c.r64 = (double)c.ri / divisor;
      break;
   }
   default:
      check(false, "unknown op: " + op.to_string());
   }
   // Secondary keys must not be NaN. The fq key stays at its zero initializer for every op that has no r128.
   c.by_f64 = std::isnan(c.r64) ? 0.0 : c.r64;
   if (touches_fq(op))
      c.by_f128 = (c.r128 != c.r128) ? 0.0L : c.r128;
   return c;
}

fp_case conformance::fdtoamt(double v, uint8_t precision)
{
   fp_case c;
   c.a64 = v;
   return compute("fdtoamt"_n, c, precision);
}

fp_case conformance::amttofd(int64_t units, uint8_t precision)
{
   fp_case c;
   c.ri = units;
   return compute("amttofd"_n, c, precision);
}

conformance::version_row conformance::version()
{
   version_table table(get_self(), get_self().value);
   return table.get_or_default(version_row{CONTRACT_VERSION, CDT_VERSION, grid_size(), fq_start(), time_point()});
}

fp_case conformance::fpcase(uint64_t id)
{
   fp_table table(get_self(), get_self().value);
   auto     it = table.find(id);
   check(it != table.end(), "case not seeded");
   return *it;
}

void conformance::seed(uint32_t from, uint32_t to)
{
   require_auth(get_self());
   const uint32_t size = grid_size();
   check(from < to, "empty range");
   check(to <= size, "range exceeds grid");

   fp_table table(get_self(), get_self().value);
   for (uint32_t id = from; id < to; id++) {
      fp_spec s;
      check(spec_at(id, s), "missing spec");
      fp_case c  = compute(s.op, case_from_spec(s), s.p);
      auto    it = table.find(id);
      if (it == table.end()) {
         table.emplace(get_self(), [&](auto& row) { static_cast<fp_case&>(row) = c; });
      } else {
         table.modify(it, get_self(), [&](auto& row) { static_cast<fp_case&>(row) = c; });
      }
   }

   version_table vt(get_self(), get_self().value);
   version_row   v    = vt.get_or_default(version_row{"", "", 0, 0, time_point()});
   v.contract_version = CONTRACT_VERSION;
   v.cdt_version      = CDT_VERSION;
   v.grid_size        = size;
   v.fq_start         = fq_start();
   if (to == size)
      v.seeded_at = current_time_point();
   vt.set(v, get_self());
}

#ifdef DEBUG
void conformance::wipe()
{
   require_auth(get_self());
   fp_table table(get_self(), get_self().value);
   auto     it = table.begin();
   while (it != table.end())
      it = table.erase(it);
   version_table vt(get_self(), get_self().value);
   vt.remove();
}
#endif

} // namespace wharfkit
