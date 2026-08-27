#pragma once

#include <eosio/eosio.hpp>
#include <eosio/singleton.hpp>
#include <eosio/time.hpp>

using namespace eosio;
using namespace std;

namespace wharfkit {

class [[eosio::contract("conformance")]] conformance : public contract
{
public:
   using contract::contract;

   struct [[eosio::table("fpcases")]] fp_case
   {
      uint64_t    id = 0;
      name        op;
      string      label;
      float       a32     = 0;
      float       b32     = 0;
      float       r32     = 0;
      double      a64     = 0;
      double      b64     = 0;
      double      r64     = 0;
      long double a128    = 0;
      long double b128    = 0;
      long double r128    = 0;
      int64_t     ri      = 0;
      int128_t    ax      = 0;
      int128_t    rx      = 0;
      bool        rb      = false;
      double      by_f64  = 0;
      long double by_f128 = 0;

      uint64_t    primary_key() const { return id; }
      double      by_double() const { return by_f64; }
      long double by_long_double() const { return by_f128; }
   };

   typedef eosio::multi_index<"fpcases"_n,
                              fp_case,
                              indexed_by<"byfd"_n, const_mem_fun<fp_case, double, &fp_case::by_double>>,
                              indexed_by<"byfq"_n, const_mem_fun<fp_case, long double, &fp_case::by_long_double>>>
      fp_table;

   struct [[eosio::table]] version_row
   {
      string     contract_version;
      string     cdt_version;
      uint32_t   grid_size;
      uint32_t   fq_start;
      time_point seeded_at;
   };
   typedef eosio::singleton<"version"_n, version_row> version_table;

   [[eosio::action, eosio::read_only]] version_row version();
   [[eosio::action, eosio::read_only]] fp_case     fpcase(uint64_t id);
   [[eosio::action]] void                          seed(uint32_t from, uint32_t to);
#ifdef DEBUG
   [[eosio::action]] void wipe();
#endif

// Each read-only op builds an fp_case from its parameters and routes through compute().
#define FP_BINARY(width, op, type, afield, bfield)                                                                     \
   [[eosio::action, eosio::read_only]] fp_case width##op(type a, type b)                                               \
   {                                                                                                                   \
      fp_case c;                                                                                                       \
      c.afield = a;                                                                                                    \
      c.bfield = b;                                                                                                    \
      return compute(#width #op##_n, c);                                                                               \
   }
#define FP_UNARY(width, op, type, afield)                                                                              \
   [[eosio::action, eosio::read_only]] fp_case width##op(type a)                                                       \
   {                                                                                                                   \
      fp_case c;                                                                                                       \
      c.afield = a;                                                                                                    \
      return compute(#width #op##_n, c);                                                                               \
   }
#define FP_FROMINT(width, op, itype, ifield)                                                                           \
   [[eosio::action, eosio::read_only]] fp_case width##op(itype a)                                                      \
   {                                                                                                                   \
      fp_case c;                                                                                                       \
      c.ifield = a;                                                                                                    \
      return compute(#width #op##_n, c);                                                                               \
   }
// Unsigned operands are stored in the signed row field as their two's-complement bit pattern.
#define FP_FROMINT_W(width, op, itype, wtype, ifield)                                                                  \
   [[eosio::action, eosio::read_only]] fp_case width##op(itype a)                                                      \
   {                                                                                                                   \
      fp_case c;                                                                                                       \
      c.ifield = (wtype)a;                                                                                             \
      return compute(#width #op##_n, c);                                                                               \
   }
#define FP_CMP(width, op, type, afield, bfield) FP_BINARY(width, op, type, afield, bfield)
#define FP_TOINT(width, op, type, afield) FP_UNARY(width, op, type, afield)

   FP_BINARY(fs, add, float, a32, b32)
   FP_BINARY(fs, sub, float, a32, b32)
   FP_BINARY(fs, mul, float, a32, b32)
   FP_BINARY(fs, div, float, a32, b32)
   FP_UNARY(fs, echo, float, a32)
   FP_BINARY(fd, add, double, a64, b64)
   FP_BINARY(fd, sub, double, a64, b64)
   FP_BINARY(fd, mul, double, a64, b64)
   FP_BINARY(fd, div, double, a64, b64)
   FP_UNARY(fd, echo, double, a64)

   FP_BINARY(fs, min, float, a32, b32)
   FP_BINARY(fs, max, float, a32, b32)
   FP_BINARY(fs, copysign, float, a32, b32)
   FP_UNARY(fs, floor, float, a32)
   FP_UNARY(fs, ceil, float, a32)
   FP_UNARY(fs, trunc, float, a32)
   FP_UNARY(fs, nearest, float, a32)
   FP_UNARY(fs, round, float, a32)
   FP_UNARY(fs, sqrt, float, a32)
   FP_UNARY(fs, neg, float, a32)
   FP_UNARY(fs, abs, float, a32)
   FP_CMP(fs, eq, float, a32, b32)
   FP_CMP(fs, ne, float, a32, b32)
   FP_CMP(fs, lt, float, a32, b32)
   FP_CMP(fs, le, float, a32, b32)
   FP_CMP(fs, gt, float, a32, b32)
   FP_CMP(fs, ge, float, a32, b32)

   FP_BINARY(fd, min, double, a64, b64)
   FP_BINARY(fd, max, double, a64, b64)
   FP_BINARY(fd, copysign, double, a64, b64)
   FP_UNARY(fd, floor, double, a64)
   FP_UNARY(fd, ceil, double, a64)
   FP_UNARY(fd, trunc, double, a64)
   FP_UNARY(fd, nearest, double, a64)
   FP_UNARY(fd, round, double, a64)
   FP_UNARY(fd, sqrt, double, a64)
   FP_UNARY(fd, neg, double, a64)
   FP_UNARY(fd, abs, double, a64)
   FP_CMP(fd, eq, double, a64, b64)
   FP_CMP(fd, ne, double, a64, b64)
   FP_CMP(fd, lt, double, a64, b64)
   FP_CMP(fd, le, double, a64, b64)
   FP_CMP(fd, gt, double, a64, b64)
   FP_CMP(fd, ge, double, a64, b64)

   FP_UNARY(fs, tofd, float, a32)
   FP_UNARY(fd, tofs, double, a64)

   FP_TOINT(fs, tois, float, a32)
   FP_TOINT(fs, tous, float, a32)
   FP_TOINT(fs, toil, float, a32)
   FP_TOINT(fs, toul, float, a32)
   FP_TOINT(fs, toix, float, a32)
   FP_TOINT(fs, toux, float, a32)
   FP_TOINT(fd, tois, double, a64)
   FP_TOINT(fd, tous, double, a64)
   FP_TOINT(fd, toil, double, a64)
   FP_TOINT(fd, toul, double, a64)
   FP_TOINT(fd, toix, double, a64)
   FP_TOINT(fd, toux, double, a64)

   FP_FROMINT(fs, fromis, int32_t, ri)
   FP_FROMINT_W(fs, fromus, uint32_t, int32_t, ri)
   FP_FROMINT(fs, fromil, int64_t, ri)
   FP_FROMINT_W(fs, fromul, uint64_t, int64_t, ri)
   FP_FROMINT(fd, fromis, int32_t, ri)
   FP_FROMINT_W(fd, fromus, uint32_t, int32_t, ri)
   FP_FROMINT(fd, fromil, int64_t, ri)
   FP_FROMINT_W(fd, fromul, uint64_t, int64_t, ri)
   FP_FROMINT(fd, fromix, int128_t, ax)
   FP_FROMINT_W(fd, fromux, uint128_t, int128_t, ax)

   FP_UNARY(fs, tofq, float, a32)
   FP_UNARY(fd, tofq, double, a64)
   FP_UNARY(fq, echo, long double, a128)
   FP_BINARY(fq, add, long double, a128, b128)
   FP_BINARY(fq, sub, long double, a128, b128)
   FP_BINARY(fq, mul, long double, a128, b128)
   FP_BINARY(fq, div, long double, a128, b128)
   FP_UNARY(fq, neg, long double, a128)
   FP_CMP(fq, eq, long double, a128, b128)
   FP_CMP(fq, ne, long double, a128, b128)
   FP_CMP(fq, lt, long double, a128, b128)
   FP_CMP(fq, le, long double, a128, b128)
   FP_CMP(fq, gt, long double, a128, b128)
   FP_CMP(fq, ge, long double, a128, b128)
   FP_CMP(fq, unord, long double, a128, b128)
   FP_UNARY(fq, tofs, long double, a128)
   FP_UNARY(fq, tofd, long double, a128)
   FP_TOINT(fq, tois, long double, a128)
   FP_TOINT(fq, tous, long double, a128)
   FP_TOINT(fq, toil, long double, a128)
   FP_TOINT(fq, toul, long double, a128)
   FP_TOINT(fq, toix, long double, a128)
   FP_TOINT(fq, toux, long double, a128)
   FP_FROMINT(fq, fromis, int32_t, ri)
   FP_FROMINT_W(fq, fromus, uint32_t, int32_t, ri)
   FP_FROMINT(fq, fromil, int64_t, ri)
   FP_FROMINT_W(fq, fromul, uint64_t, int64_t, ri)

   [[eosio::action, eosio::read_only]] fp_case fdtoamt(double v, uint8_t precision);
   [[eosio::action, eosio::read_only]] fp_case amttofd(int64_t units, uint8_t precision);

   static fp_case compute(name op, fp_case in, uint8_t precision = 0);
};

using fp_case = conformance::fp_case;

} // namespace wharfkit
